import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import { Stack, Grid2 as Grid } from '@mui/material';
import YouTube from 'react-youtube';
import style from './Sidebar.module.scss';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FeatureGroups } from '../../helpers/FeatureGroups';

const RenderAccordion = (
  data: any,
  handleGetData: any,
  selectedFeature: any,
) => {
  return data.map((group: any) => (
    <Accordion
      key={group.id}
      className={['accordion-item', style.panel].join(' ')}
      disableGutters
    >
      <AccordionSummary
        aria-controls='panel1d-content'
        id='panel1d-header'
        expandIcon={group.subItems ? <ExpandMoreIcon /> : null}
        className={`${style.navItem} ${
          group.id === selectedFeature.id && style.activeItem
        }`}
        onClick={() => handleGetData(group)}
      >
        <Stack>
          <Typography component='span'>{group.title}</Typography>
        </Stack>
      </AccordionSummary>
      {group.subItems && group.subItems.length > 0 && (
        <AccordionDetails className={`accordion-item-details`}>
          <Stack flexDirection='column'>
            {RenderAccordion(group.subItems, handleGetData, selectedFeature)}
          </Stack>
        </AccordionDetails>
      )}
    </Accordion>
  ));
};

const Sidebar = () => {
  const [selectedFeature, setSelectedFeature] = useState<any>(
    FeatureGroups[0].subItems[0],
  );

  const opts = {
    width: '100%',
    height: '500',
  };

  const handleGetData = (item: any) => {
    if (item.subItems) return;
    setSelectedFeature(item);
  };
  return (
    <Stack flexDirection='row'>
      <Stack
        width='25%'
        gap={2}
        pr={2}
        sx={{ overflowY: 'scroll', height: '800px', scrollbarWidth: 'none' }}
      >
        {RenderAccordion(FeatureGroups, handleGetData, selectedFeature)}
      </Stack>
      <Stack width='70%'>
        <Stack
          rowGap={2}
          px='2rem'
          width='100%'
          sx={{ overflowY: 'scroll', height: '800px', scrollbarWidth: 'none' }}
        >
          {selectedFeature ? (
            <>
              <Stack>
                <Typography fontSize='1.5rem'>
                  {selectedFeature.subtitle && selectedFeature.title}
                </Typography>
              </Stack>
              <Stack>
                {selectedFeature.subtitle &&
                  selectedFeature?.subtitle.map((item: any) => (
                    <Typography key={item.index} fontSize='1rem'>
                      {Array.isArray(item)
                        ? item.map((innerText: string, innerIndex: number) => (
                            <Typography
                              key={innerIndex}
                              sx={{ textIndent: '20px' }}
                            >
                              {innerText}
                            </Typography>
                          ))
                        : item}
                    </Typography>
                  ))}
              </Stack>
              {selectedFeature.img && (
                <Stack
                  display='flex'
                  justifyContent='center'
                  alignItems='center'
                  width='100%'
                >
                  {Array.isArray(selectedFeature.img) ? (
                    <Grid container spacing={2} size={12}>
                    {selectedFeature.img.map((img: any) => (
                      <Grid size={selectedFeature.img.length === 3 ? 4 : 6}>
                        <img
                          src={img}
                          alt={img.toString()}
                          style={{ borderRadius: '8px', width: '100%' }}
                          className='img'
                        />
                      </Grid>
                    ))}
                  </Grid>
                  ) : (
                    <img
                      src={selectedFeature.img}
                      alt=''
                      style={{ borderRadius: '8px', width: '100%' }}
                      className='img'
                    />
                  )}
                </Stack>
              )}
              {selectedFeature?.url && (
                <Stack>
                  <YouTube videoId={selectedFeature?.url} opts={opts} iframeClassName={style.iframe}/>
                </Stack>
              )}
            </>
          ) : null}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Sidebar;
