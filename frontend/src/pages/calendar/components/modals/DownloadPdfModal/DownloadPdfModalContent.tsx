import { memo, useEffect, useState, type FC } from 'react';
import {
  Document,
  Font,
  PDFViewer,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import axios from 'axios';
import moment from 'moment';
import PoppinsRegular from 'assets/fonts/Poppins/Poppins-Regular.ttf';
import PoppinsMedium from 'assets/fonts/Poppins/Poppins-Medium.ttf';
import PoppinsBold from 'assets/fonts/Poppins/Poppins-Bold.ttf';
import Loader from 'components/Loader/Loader';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useAppSelector } from 'store/hooks';
import { generateTimeRangeParameter } from '../../../utils/formatters';

// Register font
Font.register({
  family: 'Poppins',
  fonts: [
    {
      src: PoppinsRegular,
    },
    {
      src: PoppinsMedium,
      fontWeight: 'medium',
    },
    {
      src: PoppinsBold,
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    fontFamily: 'Poppins',
    color: '#16365f',
    fontSize: '14px',
    paddingVertical: '16px',
  },
  branchSection: { textAlign: 'center' },
  branchTitle: { fontSize: '22px', fontWeight: 'bold' },
  resourceSection: { textAlign: 'center', marginTop: '24px' },
  resourceTitle: { fontSize: '18px', fontWeight: 'bold' },
  // User Data
  container: { marginTop: '24px' },
  userSection: { textAlign: 'center' },
  userTitle: {
    fontSize: '14px',
    color: '#4d53e0',
    fontWeight: 'medium',
    textTransform: 'uppercase',
  },
  userHours: { fontSize: '12px', color: '#16365f' },
  // Table
  table: {
    width: '95%',
    marginHorizontal: 'auto',
    marginTop: '4px',
    // @ts-ignore
    display: 'table',
    border: '1px solid #dee2e6',
    borderRightWidth: 0,
    textAlign: 'center',
  },
  tableBody: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  tableRow: {
    width: 'calc(100% / 7)',
    borderRight: '1px solid #dee2e6',
  },
  tableTh: {
    padding: '4px',
    width: '100%',
    backgroundColor: 'white',
    borderBottom: '1px solid #dee2e6',
  },
  tableThText: {
    fontSize: '9px',
    color: '#16365f',
    // fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  // @ts-ignore
  tableCell: (color = '#16365f', isLast = false) => ({
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    fontSize: '9px',
    padding: '4px',
    color,
    borderBottom: '1px solid #dee2e6',
    borderBottomWidth: isLast ? 0 : 1,
    fontWeight: 'medium',
  }),
});

const UsersTableContainer = ({
  users,
  color,
}: {
  users: any[];
  color: string;
}) => {
  if (users?.length === 0) return <Text>Empty</Text>;
  return (
    <>
      {users.map((user, index) => (
        <View style={styles.container} key={index}>
          <View style={styles.userSection}>
            <Text style={{ ...styles.userTitle, color }}>{user.name}</Text>
            <Text style={styles.userHours}>Total: {user.total} hrs.</Text>
            {user.paidTotal != null && user.billableTotal && (
              <>
                <Text style={styles.userHours}>
                  Paid: {user.paidTotal} hrs.
                </Text>
                <Text style={styles.userHours}>
                  Billable: {user.billableTotal} hrs.
                </Text>
              </>
            )}
          </View>
          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableBody}>
              {user.eventsByDate.map((eventDate: any, innerIndex: number) => (
                <View style={styles.tableRow} key={innerIndex}>
                  {/* Table Head */}
                  <View style={styles.tableTh}>
                    <Text style={styles.tableThText}>
                      {eventDate.weekdayTitle}
                    </Text>
                    <Text style={styles.tableThText}>
                      {eventDate.weekdayDate}
                    </Text>
                  </View>
                  {eventDate.events.map((event: any, i: number) => {
                    const isLast = eventDate.events.length - 1 === i;
                    return (
                      <View
                        // @ts-ignore
                        style={styles.tableCell(
                          event.activityColor || '',
                          isLast,
                        )}
                        key={i}
                      >
                        {/* <Text>{event.activity}</Text> */}
                        {event.users.length > 0
                          ? event.users.map((u: any, userIndex: number) => (
                              <Text key={userIndex}>{u}</Text>
                            ))
                          : null}
                        <Text style={{ textTransform: 'lowercase' }}>
                          {event.time}
                        </Text>
                        {event.location ? <Text>{event.location}</Text> : null}
                        {event.notes ? <Text>“{event.notes}”</Text> : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}
    </>
  );
};

const DownloadPdfModalContent: FC = () => {
  const activityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const locationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const currentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const calendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const selectedCalendarsLocation = useAppSelector(
    (state) => state.calendar.selectedCalendars.location,
  );
  const selectedCalendarsActivity = useAppSelector(
    (state) => state.calendar.selectedCalendars.activity,
  );

  const isolatedResources = useAppSelector(
    (state) => state.settings.settingValues.isolatedResources,
  );
  const timezone = useAppSelector(
    (state) => state.settings.settingValues.timezone,
  );
  //
  const [pdfDataLoading, setPdfDataLoading] = useState(false);
  const [pdfData, setPdfData] = useState<any | null>(null);

  const fetchScheduler = useLatestCallback(async () => {
    setPdfDataLoading(true);
    try {
      const startOfWeek = moment(calendarStart).tz(timezone).startOf('week');
      const startRange = generateTimeRangeParameter(
        startOfWeek.format(),
        timezone,
      );
      const endRange = generateTimeRangeParameter(
        startOfWeek.add(1, 'week').format(),
        timezone,
      );

      const params = {
        branchId: currentBranches[0]?.value,
        start: startRange,
        end: endRange,
        timezone: timezone,
        locations: [] as any[] | string,
        activities: [] as any[] | string,
        resources: [] as any[] | string,
      };

      if (isolatedResources?.length) {
        const resources = isolatedResources.map((item) => item.value).join('|');
        params.resources = resources;
      }
      if (selectedCalendarsLocation?.length) {
        const locationIds = selectedCalendarsLocation.map((e) => e.id);
        const chosenLocationIds = locationResources
          .filter((e) => !locationIds.includes(e.id))
          .map((e) => e.id);
        const locations = chosenLocationIds.join('|');
        params.locations = locations;
      }
      if (selectedCalendarsActivity?.length) {
        const activityIds = selectedCalendarsActivity.map((e) => e.id);
        const chosenActivityIds = activityResources
          .filter((e) => !activityIds.includes(e.id))
          .map((e) => e.id);
        const activities = chosenActivityIds.join('|');
        params.activities = activities;
      }

      const res = await axios.get('/scheduler/events-pdf', { params });

      setPdfData(res.data);
    } catch (error) {
      console.log('error', error);
    } finally {
      setPdfDataLoading(false);
    }
  });

  useEffect(() => {
    fetchScheduler();
  }, [fetchScheduler]);

  if (pdfDataLoading || !pdfData) {
    return <Loader />;
  }

  return (
    <PDFViewer style={{ width: '100%', minHeight: '700px' }} showToolbar={true}>
      <Document creator='ABA Schedules'>
        <Page size='A4' style={styles.page}>
          <View style={styles.branchSection}>
            <Text style={styles.branchTitle}>
              {pdfData?.branch?.name || ''}
            </Text>
          </View>
          {/* Employees */}
          {pdfData?.employees && pdfData?.employees.length > 0 ? (
            <>
              <View style={styles.resourceSection}>
                <Text style={styles.resourceTitle}>Employees</Text>
              </View>
              <UsersTableContainer users={pdfData.employees} color='#4d53e0' />
            </>
          ) : null}
          {/* Clients */}
          {pdfData?.clients && pdfData?.clients.length > 0 ? (
            <>
              <View style={styles.resourceSection}>
                <Text style={styles.resourceTitle}>Clients</Text>
              </View>
              <UsersTableContainer users={pdfData.clients} color='#43bc13' />
            </>
          ) : null}
        </Page>
      </Document>
    </PDFViewer>
  );
};

DownloadPdfModalContent.displayName = 'DownloadPdfModalContent';

export default memo(DownloadPdfModalContent);
