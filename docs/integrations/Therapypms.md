# TherapyPMS Integration Documentation

## Overview

The TherapyPMS integration enables bidirectional synchronization between ABA Schedules and TherapyPMS, allowing seamless data exchange for users, events, and various resources. The integration follows a modular architecture with separate backend routes and frontend UI components.

## Backend Integration Routes

### Authentication

#### `/login-to/therapypms` (POST)
**Purpose**: Authenticates with TherapyPMS API and stores credentials for future use.

**Logic**:
1. Validates email and password credentials
2. Calls `authenticateToTherapyPMS()` to get access token
3. Stores credentials and token in `authIntegrations` table
4. Returns success/failure status

**Key Functions**:
- `loginToTherapyPMS(credentials, currentUser)`: Main authentication handler
- `authenticateToTherapyPMS(email, password)`: Makes API call to TherapyPMS login endpoint

### Resource Import Routes

#### `/import-employee/therapypms` (POST)
**Purpose**: Imports employees/providers from TherapyPMS into ABA Schedules.

**Logic**:
1. Gets already connected employees from `usersIntegrationData` table
2. Retrieves root "Employee" role for assignment
3. Fetches employees from TherapyPMS using `getEmployeeTherapyPMS()`
4. Maps TherapyPMS provider data to ABA user format:
   ```javascript
   {
     firstName: user.provider_first_name,
     lastName: user.provider_last_name,
     phoneNumber: user.provider_phone_number,
     email: user.provider_email,
     // ... other mapped fields
   }
   ```
5. Creates users in ABA and establishes integration connections

#### `/import-client/therapypms` (POST)
**Purpose**: Imports patients from TherapyPMS as clients in ABA Schedules.

**Logic**:
1. Similar to employee import but for patients
2. Maps TherapyPMS patient data:
   ```javascript
   {
     firstName: user.patient_first_name,
     lastName: user.patient_last_name,
     email: user.patient_email,
     gender: patientGender, // 'M' or 'F'
     birthday: patientFormattedBirthday,
     // ... other mapped fields
   }
   ```
3. Handles date formatting and gender conversion

#### `/import-funder/therapypms` (POST)
**Purpose**: Imports funders from TherapyPMS activities.

**Logic**:
1. Fetches activities using `getActivitiesTherapyPMS()`
2. Extracts unique funders from activity data
3. Groups activities by `funder_id`
4. Creates funder users with random email addresses

#### `/import-location/therapypms` (POST)
**Purpose**: Imports place of service locations from TherapyPMS.

**Logic**:
1. Fetches locations using `getLocationsTherapyPMS()`
2. Maps place of service data to location users
3. Uses `place_of_service_name` as user firstName

#### `/import-activity/therapypms` (POST)
**Purpose**: Imports activities from TherapyPMS.

**Logic**:
1. Fetches activities using `getActivitiesTherapyPMS()`
2. Maps activity data to activity users
3. Uses `activity_name` as user firstName

### Resource Sync Routes

#### `/sync-employee/therapypms` (POST)
**Purpose**: Synchronizes existing employee data between systems.

**Logic**:
1. Gets connected employees and ABA employees
2. Fetches updated employees from TherapyPMS
3. Uses `reconcileEntityConnections()` to categorize entities
4. Updates existing connections via `syncLinkedResources()`
5. Attempts to connect unlinked entities by name matching

#### `/sync-client/therapypms` (POST)
**Purpose**: Synchronizes patient/client data.

**Logic**: Similar to employee sync but for clients/patients.

#### `/sync-funder/therapypms`, `/sync-location/therapypms`, `/sync-activity/therapypms` (POST)
**Purpose**: Synchronize respective resource types.

**Logic**: Follow same pattern as employee/client sync.

### Event Integration Routes

#### `/integrate-events/therapypms` (POST)
**Purpose**: Pushes ABA Schedule events to TherapyPMS as appointments.

**Logic**:
1. Fetches events needing integration using `findToBeIntegratedWithIntegrationsData()`
2. Enriches events with integration data
3. Uses `syncEventsToTherapypms()` to sync:
   - Groups events by operation type (create, update, delete)
   - Maps events to TherapyPMS appointment format
   - Sends parallel API requests
4. Creates/Updates integration tracking table `eventsIntegrationData`

#### `/import-events/therapypms` (POST)
**Purpose**: Imports appointments from TherapyPMS as events in ABA Schedules.

**Logic**:
1. Gets connected resources (clients, employees, activities, locations)
2. Fetches appointments using `listAppointmentsTherapyPMS()`
3. Filters appointments by date window and connected resources
4. Maps appointments to ABA event format:
   ```javascript
   {
     start: startTz.format('YYYY-MM-DDTHH:mm:ssZ'),
     end: endTz.format('YYYY-MM-DDTHH:mm:ssZ'),
     users: [staffId, clientId],
     activity0Id: activityId,
     // ... recurring event fields
   }
   ```
5. Creates/updates events in ABA database
6. Creates/Updates integration tracking table `eventsIntegrationData`

### Utility Routes

#### `/check-login-credentials/therapypms` (GET)
**Purpose**: Checks if user has stored TherapyPMS credentials.

#### `/synced-resources` (GET)
**Purpose**: Retrieves paginated list of synced resources for display.


## Frontend Implementation

### Component Architecture

The TherapyPMS frontend integration is built with React/TypeScript using a modular component structure:

```
therapypms/
├── TherapyPmsModalContent.tsx       # Main modal with tabs
├── TherapyPmsLoginForm.tsx          # Authentication form
├── TherapyPmsPanelUsers/            # Users management tab
│   ├── TherapyPmsTabPanelUsers.tsx
│   ├── TherapyPmsResources.tsx
│   ├── TherapyPmsResourcesTable.tsx
│   └── TherapyPmsResourcesActions.tsx
└── TherapyPmsTabPanelEvents/        # Events management tab
    └── TherapyPmsTabPanelEvents.tsx
```

### Key Components

#### `TherapyPmsModalContent`
- **Purpose**: Main integration modal container
- **Features**: 
  - Tab-based interface with "Users" and "Events" tabs
  - Modal management with cancel functionality

#### `TherapyPmsLoginForm`
- **Purpose**: Handles TherapyPMS authentication
- **Features**:
  - Form validation using Formik and Yup
  - Email and password input fields
  - Loading states during authentication
  - Error handling with toast notifications
  - Calls `/integrations/login-to/therapypms` endpoint

#### `TherapyPmsTabPanelUsers`
- **Purpose**: Manages user resource operations
- **Features**:
  - Event bus for component communication
  - Resource display and action handling

#### `TherapyPmsResources`
- **Purpose**: Displays synced resources in a table
- **Features**:
  - Resource type filtering (employee, client, funder, location, activity)
  - Pagination support
  - Real-time updates via event bus
  - Uses `useTherapyPmsResourcesFetch` hook

#### `TherapyPmsResourcesActions`
- **Purpose**: Handles import and sync operations
- **Features**:
  - Import Resources button - triggers resource import workflow
  - Sync Resources button - synchronizes existing resources
  - Modal-based resource type selection
  - Status tracking and progress display
  - Navigation blocking during operations
  - Uses hooks: `useTherapyPmsResourcesImport`, `useTherapyPmsResourcesSync`

#### `TherapyPmsTabPanelEvents`
- **Purpose**: Manages event integration operations
- **Features**:
  - Event import with configurable lookback period
  - Event integration (sync to TherapyPMS) with past update options
  - Branch-aware operations
  - Loading states and error handling
  - Uses hooks: `useTherapyPmsEventsIntegrate`, `useTherapyPmsEventsImport`

### Integration Hooks

The frontend uses custom hooks for API interactions:

- `useTherapyPmsResourcesFetch`: Fetches and manages resource lists
- `useTherapyPmsResourcesImport`: Handles resource import operations
- `useTherapyPmsResourcesSync`: Manages resource synchronization
- `useTherapyPmsEventsIntegrate`: Pushes events to TherapyPMS
- `useTherapyPmsEventsImport`: Imports events from TherapyPMS

### User Interface Flow

1. **Initial Access**: User clicks TherapyPMS integration button in calendar
2. **Authentication**: Login modal appears requiring TherapyPMS credentials
3. **Main Interface**: Tabbed modal opens with Users and Events tabs
4. **Users Tab**:
   - View existing synced resources
   - Filter by resource type
   - Import new resources from TherapyPMS
   - Sync existing resource data
5. **Events Tab**:
   - Configure import/sync time periods
   - Import events from TherapyPMS
   - Push ABA events to TherapyPMS

### State Management

The integration uses Redux store slices for state management:

- `newIntegration` slice manages modal states and software selection
- Component-level state for pagination, filters, and loading states
- Event bus pattern for inter-component communication

## API Endpoints Used

### TherapyPMS API Base URL
`https://app.therapypms.com/api/aba-scheduler/admin`

### Key Endpoints
- `/login` - Authentication
- `/get/patients/list` - Fetch patients/clients
- `/get/providers/list` - Fetch providers/employees
- `/placeofservice/list` - Fetch locations
- `/patient/activity` - Fetch activities per client
- `/appointment` - Create/update appointments
- `/appointment/delete` - Delete appointments
- `/appointments/list` - List appointments with pagination
