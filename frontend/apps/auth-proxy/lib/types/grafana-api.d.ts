import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios';

declare namespace Components {
    namespace Responses {
        export type AcceptedResponse = Schemas.ErrorResponseBody;
        export type AdminCreateUserResponse = Schemas.AdminCreateUserResponse;
        export type AdminGetSettingsResponse = Schemas.SettingsBag;
        export type AdminGetStatsResponse = Schemas.AdminStats;
        export type AdminGetUserAuthTokensResponse = /* UserToken represents a user token */ Schemas.UserToken[];
        export type ApiResponse = Schemas.MessageResponse;
        export type BadRequestError = Schemas.ErrorResponseBody;
        export type BadRequestPublicError = /**
         * PublicError is derived from Error and only contains information
         * available to the end user.
         */
        Schemas.PublicError;
        export type CalculateDashboardDiffResponse = number /* uint8 */[];
        export type CloudMigrationCreateTokenResponse = Schemas.CreateAccessTokenResponseDTO;
        export interface CloudMigrationDeleteTokenResponse {
        }
        export type CloudMigrationGetTokenResponse = Schemas.GetAccessTokenResponseDTO;
        export type CloudMigrationRunListResponse = Schemas.CloudMigrationRunListDTO;
        export type CloudMigrationRunResponse = Schemas.MigrateDataResponseDTO;
        export type CloudMigrationSessionListResponse = Schemas.CloudMigrationSessionListResponseDTO;
        export type CloudMigrationSessionResponse = Schemas.CloudMigrationSessionResponseDTO;
        export type ConflictError = Schemas.ErrorResponseBody;
        export type ContentResponse = number /* uint8 */[];
        export type CreateCorrelationResponse = /* CreateCorrelationResponse is the response struct for CreateCorrelationCommand */ Schemas.CreateCorrelationResponseBody;
        export interface CreateDashboardSnapshotResponse {
            /**
             * Unique key used to delete the snapshot. It is different from the key so that only the creator can delete the snapshot.
             */
            deleteKey?: string;
            deleteUrl?: string;
            /**
             * Snapshot id
             */
            id?: number; // int64
            /**
             * Unique key
             */
            key?: string;
            url?: string;
        }
        export interface CreateOrUpdateDatasourceResponse {
            datasource: Schemas.DataSource;
            /**
             * ID Identifier of the new data source.
             * example:
             * 65
             */
            id: number; // int64
            /**
             * Message Message of the deleted dashboard.
             * example:
             * Data source added
             */
            message: string;
            /**
             * Name of the new data source.
             * example:
             * My Data source
             */
            name: string;
        }
        export interface CreateOrgResponse {
            /**
             * Message Message of the created org.
             * example:
             * Data source added
             */
            message: string;
            /**
             * ID Identifier of the created org.
             * example:
             * 65
             */
            orgId: number; // int64
        }
        export type CreatePlaylistResponse = /* Playlist model */ Schemas.Playlist;
        export type CreatePublicDashboardResponse = Schemas.PublicDashboard;
        export interface CreateReportResponse {
            id?: number; // int64
            message?: string;
        }
        export type CreateRoleResponse = Schemas.RoleDTO;
        export type CreateServiceAccountResponse = /* swagger: model */ Schemas.ServiceAccountDTO;
        export type CreateSnapshotResponse = Schemas.CreateSnapshotResponseDTO;
        export interface CreateTeamResponse {
            message?: string;
            teamId?: number; // int64
            uid?: string;
        }
        export type CreateTokenResponse = Schemas.NewApiKeyResult;
        export type DashboardResponse = Schemas.DashboardFullWithMeta;
        export type DashboardVersionResponse = /**
         * DashboardVersionMeta extends the DashboardVersionDTO with the names
         * associated with the UserIds, overriding the field with the same name from
         * the DashboardVersionDTO model.
         */
        Schemas.DashboardVersionMeta;
        export type DashboardVersionsResponse = /**
         * DashboardVersionMeta extends the DashboardVersionDTO with the names
         * associated with the UserIds, overriding the field with the same name from
         * the DashboardVersionDTO model.
         */
        Schemas.DashboardVersionMeta[];
        export type DeleteCorrelationResponse = Schemas.DeleteCorrelationResponseBody;
        export interface DeleteDashboardResponse {
            /**
             * Message Message of the deleted dashboard.
             * example:
             * Dashboard My Dashboard deleted
             */
            message: string;
            /**
             * Title Title of the deleted dashboard.
             * example:
             * My Dashboard
             */
            title: string;
            /**
             * UID Identifier of the deleted dashboard.
             * example:
             * 65
             */
            uid: string;
        }
        export interface DeleteDataSourceByNameResponse {
            /**
             * ID Identifier of the deleted data source.
             * example:
             * 65
             */
            id: number; // int64
            /**
             * Message Message of the deleted dashboard.
             * example:
             * Dashboard My Dashboard deleted
             */
            message: string;
        }
        export interface DeleteFolderResponse {
            /**
             * ID Identifier of the deleted folder.
             * example:
             * 65
             */
            id: number; // int64
            /**
             * Message Message of the deleted folder.
             * example:
             * Folder My Folder deleted
             */
            message: string;
            /**
             * Title of the deleted folder.
             * example:
             * My Folder
             */
            title: string;
        }
        export type DevicesResponse = Schemas.DeviceDTO[];
        export type DevicesSearchResponse = Schemas.SearchDeviceQueryResult;
        export type FolderResponse = Schemas.Folder;
        export type ForbiddenError = Schemas.ErrorResponseBody;
        export type ForbiddenPublicError = /**
         * PublicError is derived from Error and only contains information
         * available to the end user.
         */
        Schemas.PublicError;
        export type GenericError = Schemas.ErrorResponseBody;
        export type GetAPIkeyResponse = Schemas.ApiKeyDTO[];
        export type GetAccessControlStatusResponse = Schemas.Status /* int64 */;
        export type GetAllIntervalsResponse = Schemas.GettableTimeIntervals[];
        export type GetAllRolesResponse = Schemas.RoleDTO[];
        export type GetAnnotationByIDResponse = Schemas.Annotation;
        export type GetAnnotationTagsResponse = /* GetAnnotationTagsResponse is a response struct for FindTagsResult. */ Schemas.GetAnnotationTagsResponse;
        export type GetAnnotationsResponse = Schemas.Annotation[];
        export type GetCorrelationResponse = /* Correlation is the model for correlations definitions */ Schemas.Correlation;
        export type GetCorrelationsBySourceUIDResponse = /* Correlation is the model for correlations definitions */ Schemas.Correlation[];
        export type GetCorrelationsResponse = /* Correlation is the model for correlations definitions */ Schemas.Correlation[];
        export type GetCurrentOrgResponse = Schemas.OrgDetailsDTO;
        export type GetDashboardPermissionsListResponse = Schemas.DashboardACLInfoDTO[];
        export interface GetDashboardSnapshotResponse {
        }
        export type GetDashboardsTagsResponse = Schemas.DashboardTagCloudItem[];
        export interface GetDataSourceIDResponse {
            /**
             * ID Identifier of the data source.
             * example:
             * 65
             */
            id: number; // int64
        }
        export type GetDataSourceResponse = Schemas.DataSource;
        export type GetDataSourcesResponse = Schemas.DataSourceList;
        export type GetFolderDescendantCountsResponse = Schemas.DescendantCounts;
        export type GetFolderPermissionListResponse = Schemas.DashboardACLInfoDTO[];
        export type GetFoldersResponse = Schemas.FolderSearchHit[];
        export type GetGroupRolesResponse = Schemas.RoleDTO[];
        export type GetGroupsResponse = Schemas.GetGroupsResponse;
        export type GetHomeDashboardResponse = /* Get home dashboard response. */ Schemas.GetHomeDashboardResponse;
        export type GetIntervalsByNameResponse = Schemas.GettableTimeIntervals;
        export type GetLibraryElementArrayResponse = /* LibraryElementArrayResponse is a response struct for an array of LibraryElementDTO. */ Schemas.LibraryElementArrayResponse;
        export type GetLibraryElementConnectionsResponse = /* LibraryElementConnectionsResponse is a response struct for an array of LibraryElementConnectionDTO. */ Schemas.LibraryElementConnectionsResponse;
        export type GetLibraryElementResponse = /* LibraryElementResponse is a response struct for LibraryElementDTO. */ Schemas.LibraryElementResponse;
        export type GetLibraryElementsResponse = /* LibraryElementSearchResponse is a response struct for LibraryElementSearchResult. */ Schemas.LibraryElementSearchResponse;
        export type GetLicenseTokenResponse = Schemas.Token;
        export type GetOrgByIDResponse = Schemas.OrgDetailsDTO;
        export type GetOrgByNameResponse = Schemas.OrgDetailsDTO;
        export type GetOrgUsersForCurrentOrgLookupResponse = Schemas.UserLookupDTO[];
        export type GetOrgUsersForCurrentOrgResponse = Schemas.OrgUserDTO[];
        export type GetOrgUsersResponse = Schemas.OrgUserDTO[];
        export type GetPendingOrgInvitesResponse = Schemas.TempUserDTO[];
        export type GetPlaylistDashboardsResponse = Schemas.PlaylistDashboardsSlice;
        export type GetPlaylistItemsResponse = Schemas.PlaylistItemDTO[];
        export type GetPlaylistResponse = Schemas.PlaylistDTO;
        export type GetPreferencesResponse = /* Spec defines user, team or org Grafana preferences */ Schemas.Preferences;
        export type GetPublicAnnotationsResponse = Schemas.AnnotationEvent[];
        export type GetPublicDashboardResponse = Schemas.PublicDashboard;
        export type GetQueryHistoryDeleteQueryResponse = /* QueryHistoryDeleteQueryResponse is the response struct for deleting a query from query history */ Schemas.QueryHistoryDeleteQueryResponse;
        export type GetQueryHistoryResponse = /* QueryHistoryResponse is a response struct for QueryHistoryDTO */ Schemas.QueryHistoryResponse;
        export type GetQueryHistorySearchResponse = Schemas.QueryHistorySearchResponse;
        export type GetQuotaResponse = Schemas.QuotaDTO[];
        export type GetReceiverResponse = Schemas.GettableApiReceiver;
        export type GetReceiversResponse = Schemas.GettableApiReceiver[];
        export type GetReportResponse = Schemas.Report;
        export type GetReportSettingsResponse = Schemas.ReportSettings;
        export type GetReportsResponse = Schemas.Report[];
        export type GetResourcePermissionsResponse = Schemas.ResourcePermissionDTO[];
        export type GetRoleAssignmentsResponse = Schemas.RoleAssignmentsDTO;
        export type GetRoleResponse = Schemas.RoleDTO;
        export interface GetSSOSettingsResponse {
            id?: string;
            provider?: string;
            settings?: {
                [name: string]: any;
            };
            source?: string;
        }
        export interface GetSharingOptionsResponse {
            externalEnabled?: boolean;
            externalSnapshotName?: string;
            externalSnapshotURL?: string;
        }
        export type GetSignedInUserOrgListResponse = Schemas.UserOrgDTO[];
        export type GetSignedInUserTeamListResponse = Schemas.TeamDTO[];
        export type GetSnapshotResponse = Schemas.GetSnapshotResponseDTO;
        export interface GetStatusResponse {
        }
        export type GetSyncStatusResponse = /* ActiveSyncStatusDTO holds the information for LDAP background Sync */ Schemas.ActiveSyncStatusDTO;
        export type GetTeamByIDResponse = Schemas.TeamDTO;
        export type GetTeamGroupsApiResponse = Schemas.TeamGroupDTO[];
        export type GetTeamLBACRulesResponse = Schemas.TeamLBACRules;
        export type GetTeamMembersResponse = Schemas.TeamMemberDTO[];
        export type GetUserAuthTokensResponse = /* UserToken represents a user token */ Schemas.UserToken[];
        export type GetUserOrgListResponse = Schemas.UserOrgDTO[];
        export type GetUserTeamsResponse = Schemas.TeamDTO[];
        export type GettableHistoricUserConfigs = Schemas.GettableHistoricUserConfig[];
        export type GoneError = Schemas.ErrorResponseBody;
        export interface HelpFlagResponse {
            helpFlags1?: number; // int64
            message?: string;
        }
        export type ImportDashboardResponse = /* ImportDashboardResponse response object returned when importing a dashboard. */ Schemas.ImportDashboardResponse;
        export type InternalServerError = Schemas.ErrorResponseBody;
        export type InternalServerPublicError = /**
         * PublicError is derived from Error and only contains information
         * available to the end user.
         */
        Schemas.PublicError;
        export interface JwksResponse {
            keys?: /**
             * JSONWebKey represents a public or private key in JWK format. It can be
             * marshaled into JSON and unmarshaled from JSON.
             */
            Schemas.JSONWebKey[];
        }
        export interface ListBuiltinRolesResponse {
            [name: string]: Schemas.RoleDTO[];
        }
        export type ListPublicDashboardsResponse = Schemas.PublicDashboardListResponseWithPagination;
        export type ListRecordingRulesResponse = /* RecordingRuleJSON is the external representation of a recording rule */ Schemas.RecordingRuleJSON[];
        export type ListRolesResponse = Schemas.RoleDTO[];
        export type ListSSOSettingsResponse = {
            id?: string;
            provider?: string;
            settings?: {
                [name: string]: any;
            };
            source?: string;
        }[];
        export interface ListSortOptionsResponse {
            description?: string;
            displayName?: string;
            meta?: string;
            name?: string;
        }
        export interface ListTeamsRolesResponse {
            [name: string]: Schemas.RoleDTO[];
        }
        export type ListTokensResponse = Schemas.TokenDTO[];
        export interface ListUsersRolesResponse {
            [name: string]: Schemas.RoleDTO[];
        }
        export interface NoContentResponse {
        }
        export type NotAcceptableError = Schemas.ErrorResponseBody;
        export type NotFoundError = Schemas.ErrorResponseBody;
        export type NotFoundPublicError = /**
         * PublicError is derived from Error and only contains information
         * available to the end user.
         */
        Schemas.PublicError;
        export type OkResponse = Schemas.SuccessResponseBody;
        export interface PostAnnotationResponse {
            /**
             * ID Identifier of the created annotation.
             * example:
             * 65
             */
            id: number; // int64
            /**
             * Message Message of the created annotation.
             */
            message: string;
        }
        export interface PostDashboardResponse {
            /**
             * FolderUID The unique identifier (uid) of the folder the dashboard belongs to.
             */
            folderUid?: string;
            /**
             * ID The unique identifier (id) of the created/updated dashboard.
             * example:
             * 1
             */
            id: number; // int64
            /**
             * Status status of the response.
             * example:
             * success
             */
            status: string;
            /**
             * Slug The slug of the dashboard.
             * example:
             * my-dashboard
             */
            title: string;
            /**
             * UID The unique identifier (uid) of the created/updated dashboard.
             * example:
             * nHz3SXiiz
             */
            uid: string;
            /**
             * URL The relative URL for accessing the created/updated dashboard.
             * example:
             * /d/nHz3SXiiz/my-dashboard
             */
            url: string;
            /**
             * Version The version of the dashboard.
             * example:
             * 2
             */
            version: number; // int64
        }
        export interface PostRenewLicenseTokenResponse {
        }
        export type PreconditionFailedError = Schemas.ErrorResponseBody;
        export type PublicErrorResponse = /**
         * PublicError is derived from Error and only contains information
         * available to the end user.
         */
        Schemas.PublicError;
        export type QueryMetricsWithExpressionsRespons = /**
         * QueryDataResponse contains the results from a QueryDataRequest.
         * It is the return type of a QueryData call.
         */
        Schemas.QueryDataResponse;
        export type QueryPublicDashboardResponse = /**
         * QueryDataResponse contains the results from a QueryDataRequest.
         * It is the return type of a QueryData call.
         */
        Schemas.QueryDataResponse;
        export type ReceiversResponse = /* Receiver configuration provides configuration on how to contact a receiver. */ Schemas.Receiver[];
        export type RecordingRuleResponse = /* RecordingRuleJSON is the external representation of a recording rule */ Schemas.RecordingRuleJSON;
        export type RecordingRuleWriteTargetResponse = Schemas.PrometheusRemoteWriteTargetJSON;
        export type RefreshLicenseStatsResponse = Schemas.ActiveUserStats;
        export type ResourcePermissionsDescription = Schemas.Description;
        export type RetrieveServiceAccountResponse = /* swagger: model */ Schemas.ServiceAccountDTO;
        export interface SMTPNotEnabledError {
        }
        export type SearchDashboardSnapshotsResponse = /* DashboardSnapshotDTO without dashboard map */ Schemas.DashboardSnapshotDTO[];
        export type SearchOrgServiceAccountsWithPagingResponse = /* swagger: model */ Schemas.SearchOrgServiceAccountsResult;
        export type SearchOrgUsersResponse = Schemas.SearchOrgUsersQueryResult;
        export type SearchOrgsResponse = Schemas.OrgDTO[];
        export type SearchPlaylistsResponse = Schemas.Playlists;
        export type SearchResponse = Schemas.HitList;
        export type SearchResultResponse = Schemas.SearchResult;
        export type SearchTeamsResponse = Schemas.SearchTeamQueryResult;
        export type SearchUsersResponse = Schemas.UserSearchHitDTO[];
        export type SearchUsersWithPagingResponse = Schemas.SearchUserQueryResult;
        export type SetRoleAssignmentsResponse = Schemas.RoleAssignmentsDTO;
        export type SnapshotListResponse = Schemas.SnapshotListResponseDTO;
        export type StateHistory = /**
         * Frame is a columnar data structure where each column is a Field.
         * Each Field is well typed by its FieldType and supports optional Labels.
         *
         * A Frame is a general data container for Grafana. A Frame can be table data
         * or time series data depending on its content and field types.
         */
        Schemas.Frame;
        export type StatusMovedPermanently = Schemas.ErrorResponseBody;
        export type TestGrafanaRuleResponse = /* PostableAlert postable alert */ Schemas.PostableAlert[];
        export type UnauthorisedError = Schemas.ErrorResponseBody;
        export type UnauthorisedPublicError = /**
         * PublicError is derived from Error and only contains information
         * available to the end user.
         */
        Schemas.PublicError;
        export type UnprocessableEntityError = Schemas.ErrorResponseBody;
        export type UpdateCorrelationResponse = Schemas.UpdateCorrelationResponseBody;
        export type UpdatePlaylistResponse = Schemas.PlaylistDTO;
        export type UpdatePublicDashboardResponse = Schemas.PublicDashboard;
        export interface UpdateServiceAccountResponse {
            id?: number; // int64
            message?: string;
            name?: string;
            serviceaccount?: Schemas.ServiceAccountProfileDTO;
        }
        export interface UpdateTeamLBACRulesResponse {
            id?: number; // int64
            message?: string;
            name?: string;
            rules?: Schemas.TeamLBACRule[];
            uid?: string;
        }
        export type UserResponse = Schemas.UserProfileDTO;
        export type ViewPublicDashboardResponse = Schemas.DashboardFullWithMeta;
    }
    namespace Schemas {
        export interface Ack {
        }
        /**
         * ActiveSyncStatusDTO holds the information for LDAP background Sync
         */
        export interface ActiveSyncStatusDTO {
            enabled?: boolean;
            nextSync?: string; // date-time
            prevSync?: /* SyncResult holds the result of a sync with LDAP. This gives us information on which users were updated and how. */ SyncResult;
            schedule?: string;
        }
        export interface ActiveUserStats {
            active_admins_and_editors?: number; // int64
            active_anonymous_devices?: number; // int64
            active_users?: number; // int64
            active_viewers?: number; // int64
        }
        export interface AddAPIKeyCommand {
            name?: string;
            role?: "None" | "Viewer" | "Editor" | "Admin";
            secondsToLive?: number; // int64
        }
        /**
         * Also acts as api DTO
         */
        export interface AddDataSourceCommand {
            access?: DsAccess;
            basicAuth?: boolean;
            basicAuthUser?: string;
            database?: string;
            isDefault?: boolean;
            jsonData?: Json;
            name?: string;
            secureJsonData?: {
                [name: string]: string;
            };
            type?: string;
            uid?: string;
            url?: string;
            user?: string;
            withCredentials?: boolean;
        }
        export interface AddInviteForm {
            loginOrEmail?: string;
            name?: string;
            role?: "None" | "Viewer" | "Editor" | "Admin";
            sendEmail?: boolean;
        }
        export interface AddOrgUserCommand {
            loginOrEmail?: string;
            role?: "None" | "Viewer" | "Editor" | "Admin";
        }
        export interface AddServiceAccountTokenCommand {
            name?: string;
            secondsToLive?: number; // int64
        }
        export interface AddTeamMemberCommand {
            userId?: number; // int64
        }
        export interface AddTeamRoleCommand {
            roleUid?: string;
        }
        export interface AddUserRoleCommand {
            global?: boolean;
            roleUid?: string;
        }
        export interface Address {
            address1?: string;
            address2?: string;
            city?: string;
            country?: string;
            state?: string;
            zipCode?: string;
        }
        export interface AdminCreateUserForm {
            email?: string;
            login?: string;
            name?: string;
            orgId?: number; // int64
            password?: Password;
        }
        export interface AdminCreateUserResponse {
            id?: number; // int64
            message?: string;
            uid?: string;
        }
        export interface AdminStats {
            activeAdmins?: number; // int64
            activeDevices?: number; // int64
            activeEditors?: number; // int64
            activeSessions?: number; // int64
            activeUsers?: number; // int64
            activeViewers?: number; // int64
            admins?: number; // int64
            alerts?: number; // int64
            dailyActiveAdmins?: number; // int64
            dailyActiveEditors?: number; // int64
            dailyActiveSessions?: number; // int64
            dailyActiveUsers?: number; // int64
            dailyActiveViewers?: number; // int64
            dashboards?: number; // int64
            datasources?: number; // int64
            editors?: number; // int64
            monthlyActiveUsers?: number; // int64
            orgs?: number; // int64
            playlists?: number; // int64
            snapshots?: number; // int64
            stars?: number; // int64
            tags?: number; // int64
            users?: number; // int64
            viewers?: number; // int64
        }
        export interface AdminUpdateUserPasswordForm {
            password?: Password;
        }
        export interface AdminUpdateUserPermissionsForm {
            isGrafanaAdmin?: boolean;
        }
        /**
         * Alert alert
         */
        export interface Alert {
            /**
             * generator URL
             * Format: uri
             */
            generatorURL?: string; // uri
            labels: /* LabelSet label set */ LabelSet;
        }
        /**
         * AlertDiscovery has info for all active alerts.
         */
        export interface AlertDiscovery {
            alerts: /* Alert has info for an alert. */ Alert[];
        }
        /**
         * AlertGroup alert group
         */
        export interface AlertGroup {
            /**
             * alerts
             */
            alerts: /* GettableAlert gettable alert */ GettableAlert[];
            labels: /* LabelSet label set */ LabelSet;
            receiver: /* Receiver receiver */ Receiver;
        }
        export type AlertGroups = /* AlertGroup alert group */ AlertGroup[];
        export interface AlertInstancesResponse {
            /**
             * Instances is an array of arrow encoded dataframes
             * each frame has a single row, and a column for each instance (alert identified by unique labels) with a boolean value (firing/not firing)
             */
            instances?: number /* uint8 */[][];
        }
        /**
         * AlertManager models a configured Alert Manager.
         */
        export interface AlertManager {
            url?: string;
        }
        export interface AlertManagerNotReady {
        }
        /**
         * AlertManagersResult contains the result from querying the alertmanagers endpoint.
         */
        export interface AlertManagersResult {
            activeAlertManagers?: /* AlertManager models a configured Alert Manager. */ AlertManager[];
            droppedAlertManagers?: /* AlertManager models a configured Alert Manager. */ AlertManager[];
        }
        /**
         * AlertQuery represents a single query associated with an alert definition.
         */
        export interface AlertQuery {
            /**
             * Grafana data source unique identifier; it should be '__expr__' for a Server Side Expression operation.
             */
            datasourceUid?: string;
            /**
             * JSON is the raw JSON query and includes the above properties as well as custom properties.
             */
            model?: {
                [key: string]: any;
            };
            /**
             * QueryType is an optional identifier for the type of query.
             * It can be used to distinguish different types of queries.
             */
            queryType?: string;
            /**
             * RefID is the unique identifier of the query, set by the frontend call.
             */
            refId?: string;
            relativeTimeRange?: /**
             * RelativeTimeRange is the per query start and end time
             * for requests.
             */
            RelativeTimeRange;
        }
        /**
         * AlertQueryExport is the provisioned export of models.AlertQuery.
         */
        export interface AlertQueryExport {
            datasourceUid?: string;
            model?: {
                [name: string]: any;
            };
            queryType?: string;
            refId?: string;
            relativeTimeRange?: RelativeTimeRangeExport;
        }
        export interface AlertResponse {
            data?: /* AlertDiscovery has info for all active alerts. */ AlertDiscovery;
            error?: string;
            errorType?: /* ErrorType models the different API error types. */ ErrorType;
            status: string;
        }
        export interface AlertRuleEditorSettings {
            simplified_notifications_section?: boolean;
            simplified_query_and_expressions_section?: boolean;
        }
        /**
         * AlertRuleExport is the provisioned file export of models.AlertRule.
         */
        export interface AlertRuleExport {
            annotations?: {
                [name: string]: string;
            };
            condition?: string;
            dashboardUid?: string;
            data?: /* AlertQueryExport is the provisioned export of models.AlertQuery. */ AlertQueryExport[];
            execErrState?: "OK" | "Alerting" | "Error";
            for?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            isPaused?: boolean;
            labels?: {
                [name: string]: string;
            };
            noDataState?: "Alerting" | "NoData" | "OK";
            notification_settings?: /* AlertRuleNotificationSettingsExport is the provisioned export of models.NotificationSettings. */ AlertRuleNotificationSettingsExport;
            panelId?: number; // int64
            record?: /* Record is the provisioned export of models.Record. */ AlertRuleRecordExport;
            title?: string;
            uid?: string;
        }
        export interface AlertRuleGroup {
            folderUid?: string;
            interval?: number; // int64
            rules?: ProvisionedAlertRule[];
            title?: string;
        }
        /**
         * AlertRuleGroupExport is the provisioned file export of AlertRuleGroupV1.
         */
        export interface AlertRuleGroupExport {
            folder?: string;
            interval?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            name?: string;
            orgId?: number; // int64
            rules?: /* AlertRuleExport is the provisioned file export of models.AlertRule. */ AlertRuleExport[];
        }
        export interface AlertRuleGroupMetadata {
            interval?: number; // int64
        }
        export interface AlertRuleMetadata {
            editor_settings?: AlertRuleEditorSettings;
        }
        export interface AlertRuleNotificationSettings {
            /**
             * Override the labels by which incoming alerts are grouped together. For example, multiple alerts coming in for
             * cluster=A and alertname=LatencyHigh would be batched into a single group. To aggregate by all possible labels
             * use the special value '...' as the sole label name.
             * This effectively disables aggregation entirely, passing through all alerts as-is. This is unlikely to be what
             * you want, unless you have a very low alert volume or your upstream notification system performs its own grouping.
             * Must include 'alertname' and 'grafana_folder' if not using '...'.
             * example:
             * [
             *   "alertname",
             *   "grafana_folder",
             *   "cluster"
             * ]
             */
            group_by?: string[];
            /**
             * Override how long to wait before sending a notification about new alerts that are added to a group of alerts for
             * which an initial notification has already been sent. (Usually ~5m or more.)
             * example:
             * 5m
             */
            group_interval?: string;
            /**
             * Override how long to initially wait to send a notification for a group of alerts. Allows to wait for an
             * inhibiting alert to arrive or collect more initial alerts for the same group. (Usually ~0s to few minutes.)
             * example:
             * 30s
             */
            group_wait?: string;
            /**
             * Override the times when notifications should be muted. These must match the name of a mute time interval defined
             * in the alertmanager configuration mute_time_intervals section. When muted it will not send any notifications, but
             * otherwise acts normally.
             * example:
             * [
             *   "maintenance"
             * ]
             */
            mute_time_intervals?: string[];
            /**
             * Name of the receiver to send notifications to.
             * example:
             * grafana-default-email
             */
            receiver: string;
            /**
             * Override how long to wait before sending a notification again if it has already been sent successfully for an
             * alert. (Usually ~3h or more).
             * Note that this parameter is implicitly bound by Alertmanager's `--data.retention` configuration flag.
             * Notifications will be resent after either repeat_interval or the data retention period have passed, whichever
             * occurs first. `repeat_interval` should not be less than `group_interval`.
             * example:
             * 4h
             */
            repeat_interval?: string;
        }
        /**
         * AlertRuleNotificationSettingsExport is the provisioned export of models.NotificationSettings.
         */
        export interface AlertRuleNotificationSettingsExport {
            group_by?: string[];
            group_interval?: string;
            group_wait?: string;
            mute_time_intervals?: string[];
            receiver?: string;
            repeat_interval?: string;
        }
        /**
         * Record is the provisioned export of models.Record.
         */
        export interface AlertRuleRecordExport {
            from?: string;
            metric?: string;
            targetDatasourceUid?: string;
        }
        /**
         * AlertStatus alert status
         */
        export interface AlertStatus {
            /**
             * inhibited by
             */
            inhibitedBy: string[];
            /**
             * silenced by
             */
            silencedBy: string[];
            /**
             * state
             */
            state: "[unprocessed active suppressed]";
        }
        /**
         * AlertingFileExport is the full provisioned file export.
         */
        export interface AlertingFileExport {
            apiVersion?: number; // int64
            contactPoints?: /* ContactPointExport is the provisioned file export of alerting.ContactPointV1. */ ContactPointExport[];
            groups?: /* AlertRuleGroupExport is the provisioned file export of AlertRuleGroupV1. */ AlertRuleGroupExport[];
            muteTimes?: MuteTimeIntervalExport[];
            policies?: /* NotificationPolicyExport is the provisioned file export of alerting.NotificiationPolicyV1. */ NotificationPolicyExport[];
        }
        /**
         * adapted from cortex
         */
        export interface AlertingRule {
            activeAt: string; // date-time
            alerts?: /* Alert has info for an alert. */ Alert[];
            annotations: /**
             * Labels is a sorted set of labels. Order has to be guaranteed upon
             * instantiation.
             */
            Labels;
            duration?: number; // double
            evaluationTime?: number; // double
            folderUid: string;
            health: string;
            labels?: /**
             * Labels is a sorted set of labels. Order has to be guaranteed upon
             * instantiation.
             */
            Labels;
            lastError?: string;
            lastEvaluation?: string; // date-time
            name: string;
            query: string;
            /**
             * State can be "pending", "firing", "inactive".
             */
            state: string;
            totals?: {
                [name: string]: number; // int64
            };
            totalsFiltered?: {
                [name: string]: number; // int64
            };
            type: string;
            uid: string;
        }
        export interface AlertingStatus {
            alertmanagersChoice?: "all" | "internal" | "external";
            numExternalAlertmanagers?: number; // int64
        }
        /**
         * AlertmanagerConfig alertmanager config
         */
        export interface AlertmanagerConfig {
            /**
             * original
             */
            original: string;
        }
        /**
         * AlertmanagerStatus alertmanager status
         */
        export interface AlertmanagerStatus {
            cluster: /* ClusterStatus cluster status */ ClusterStatus;
            config: /* AlertmanagerConfig alertmanager config */ AlertmanagerConfig;
            /**
             * uptime
             */
            uptime: string; // date-time
            versionInfo: /* VersionInfo version info */ VersionInfo;
        }
        export interface Annotation {
            alertId?: number; // int64
            alertName?: string;
            avatarUrl?: string;
            created?: number; // int64
            dashboardId?: number; // int64
            dashboardUID?: string;
            data?: Json;
            email?: string;
            id?: number; // int64
            login?: string;
            newState?: string;
            panelId?: number; // int64
            prevState?: string;
            tags?: string[];
            text?: string;
            time?: number; // int64
            timeEnd?: number; // int64
            updated?: number; // int64
            userId?: number; // int64
        }
        /**
         * +k8s:deepcopy-gen=true
         */
        export interface AnnotationActions {
            canAdd?: boolean;
            canDelete?: boolean;
            canEdit?: boolean;
        }
        export interface AnnotationEvent {
            color?: string;
            dashboardId?: number; // int64
            id?: number; // int64
            isRegion?: boolean;
            panelId?: number; // int64
            source?: /**
             * TODO docs
             * FROM: AnnotationQuery in grafana-data/src/types/annotations.ts
             */
            AnnotationQuery;
            tags?: string[];
            text?: string;
            time?: number; // int64
            timeEnd?: number; // int64
        }
        export interface AnnotationPanelFilter {
            /**
             * Should the specified panels be included or excluded
             */
            exclude?: boolean;
            /**
             * Panel IDs that should be included or excluded
             */
            ids?: number /* uint8 */[];
        }
        /**
         * +k8s:deepcopy-gen=true
         */
        export interface AnnotationPermission {
            dashboard?: /* +k8s:deepcopy-gen=true */ AnnotationActions;
            organization?: /* +k8s:deepcopy-gen=true */ AnnotationActions;
        }
        /**
         * TODO docs
         * FROM: AnnotationQuery in grafana-data/src/types/annotations.ts
         */
        export interface AnnotationQuery {
            /**
             * Set to 1 for the standard annotation query all dashboards have by default.
             */
            builtIn?: number; // double
            datasource?: /* Ref to a DataSource instance */ DataSourceRef;
            /**
             * When enabled the annotation query is issued with every dashboard refresh
             */
            enable?: boolean;
            filter?: AnnotationPanelFilter;
            /**
             * Annotation queries can be toggled on or off at the top of the dashboard.
             * When hide is true, the toggle is not shown in the dashboard.
             */
            hide?: boolean;
            /**
             * Color to use for the annotation event markers
             */
            iconColor?: string;
            /**
             * Name of annotation.
             */
            name?: string;
            target?: /**
             * TODO: this should be a regular DataQuery that depends on the selected dashboard
             * these match the properties of the "grafana" datasouce that is default in most dashboards
             */
            AnnotationTarget;
            /**
             * TODO -- this should not exist here, it is based on the --grafana-- datasource
             */
            type?: string;
        }
        /**
         * TODO: this should be a regular DataQuery that depends on the selected dashboard
         * these match the properties of the "grafana" datasouce that is default in most dashboards
         */
        export interface AnnotationTarget {
            /**
             * Only required/valid for the grafana datasource...
             * but code+tests is already depending on it so hard to change
             */
            limit?: number; // int64
            /**
             * Only required/valid for the grafana datasource...
             * but code+tests is already depending on it so hard to change
             */
            matchAny?: boolean;
            /**
             * Only required/valid for the grafana datasource...
             * but code+tests is already depending on it so hard to change
             */
            tags?: string[];
            /**
             * Only required/valid for the grafana datasource...
             * but code+tests is already depending on it so hard to change
             */
            type?: string;
        }
        export interface ApiKeyDTO {
            accessControl?: /**
             * Metadata contains user accesses for a given resource
             * Ex: map[string]bool{"create":true, "delete": true}
             */
            Metadata;
            expiration?: string; // date-time
            id?: number; // int64
            lastUsedAt?: string; // date-time
            name?: string;
            role?: "None" | "Viewer" | "Editor" | "Admin";
        }
        export interface ApiRuleNode {
            alert?: string;
            annotations?: {
                [name: string]: string;
            };
            expr?: string;
            for?: string;
            keep_firing_for?: string;
            labels?: {
                [name: string]: string;
            };
            record?: string;
        }
        export interface Assignments {
            builtInRoles?: boolean;
            serviceAccounts?: boolean;
            teams?: boolean;
            users?: boolean;
        }
        /**
         * AttributeTypeAndValue mirrors the ASN.1 structure of the same name in
         * RFC 5280, Section 4.1.2.4.
         */
        export interface AttributeTypeAndValue {
            Type?: /* An ObjectIdentifier represents an ASN.1 OBJECT IDENTIFIER. */ ObjectIdentifier;
            Value?: any;
        }
        /**
         * Authorization contains HTTP authorization credentials.
         */
        export interface Authorization {
            credentials?: /* Secret special type for storing secrets. */ Secret;
            credentials_file?: string;
            /**
             * CredentialsRef is the name of the secret within the secret manager to use as credentials.
             */
            credentials_ref?: string;
            type?: string;
        }
        export interface BacktestConfig {
            annotations?: {
                [name: string]: string;
            };
            condition?: string;
            data?: /* AlertQuery represents a single query associated with an alert definition. */ AlertQuery[];
            for?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            from?: string; // date-time
            interval?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            labels?: {
                [name: string]: string;
            };
            no_data_state?: "Alerting" | "NoData" | "OK";
            title?: string;
            to?: string; // date-time
        }
        export type BacktestResult = /**
         * Frame is a columnar data structure where each column is a Field.
         * Each Field is well typed by its FieldType and supports optional Labels.
         *
         * A Frame is a general data container for Grafana. A Frame can be table data
         * or time series data depending on its content and field types.
         */
        Frame;
        /**
         * BasicAuth contains basic HTTP authentication credentials.
         */
        export interface BasicAuth {
            password?: /* Secret special type for storing secrets. */ Secret;
            password_file?: string;
            /**
             * PasswordRef is the name of the secret within the secret manager to use as the password.
             */
            password_ref?: string;
            username?: string;
            username_file?: string;
            /**
             * UsernameRef is the name of the secret within the secret manager to use as the username.
             */
            username_ref?: string;
        }
        /**
         * Config defines the internal representation of a cache configuration, including fields not set by the API caller
         */
        export interface CacheConfig {
            created?: string; // date-time
            /**
             * Fields that can be set by the API caller - read/write
             */
            dataSourceID?: number; // int64
            dataSourceUID?: string;
            /**
             * These are returned by the HTTP API, but are managed internally - read-only
             * Note: 'created' and 'updated' are special properties managed automatically by xorm, but we are setting them manually
             */
            defaultTTLMs?: number; // int64
            enabled?: boolean;
            /**
             * TTL MS, or "time to live", is how long a cached item will stay in the cache before it is removed (in milliseconds)
             */
            ttlQueriesMs?: number; // int64
            ttlResourcesMs?: number; // int64
            updated?: string; // date-time
            /**
             * If UseDefaultTTL is enabled, then the TTLQueriesMS and TTLResourcesMS in this object is always sent as the default TTL located in grafana.ini
             */
            useDefaultTTL?: boolean;
        }
        export interface CacheConfigResponse {
            created?: string; // date-time
            /**
             * Fields that can be set by the API caller - read/write
             */
            dataSourceID?: number; // int64
            dataSourceUID?: string;
            /**
             * These are returned by the HTTP API, but are managed internally - read-only
             * Note: 'created' and 'updated' are special properties managed automatically by xorm, but we are setting them manually
             */
            defaultTTLMs?: number; // int64
            enabled?: boolean;
            message?: string;
            /**
             * TTL MS, or "time to live", is how long a cached item will stay in the cache before it is removed (in milliseconds)
             */
            ttlQueriesMs?: number; // int64
            ttlResourcesMs?: number; // int64
            updated?: string; // date-time
            /**
             * If UseDefaultTTL is enabled, then the TTLQueriesMS and TTLResourcesMS in this object is always sent as the default TTL located in grafana.ini
             */
            useDefaultTTL?: boolean;
        }
        /**
         * ConfigSetter defines the cache parameters that users can configure per datasource
         * This is only intended to be consumed by the SetCache HTTP Handler
         */
        export interface CacheConfigSetter {
            dataSourceID?: number; // int64
            dataSourceUID?: string;
            enabled?: boolean;
            /**
             * TTL MS, or "time to live", is how long a cached item will stay in the cache before it is removed (in milliseconds)
             */
            ttlQueriesMs?: number; // int64
            ttlResourcesMs?: number; // int64
            /**
             * If UseDefaultTTL is enabled, then the TTLQueriesMS and TTLResourcesMS in this object is always sent as the default TTL located in grafana.ini
             */
            useDefaultTTL?: boolean;
        }
        export interface CalculateDiffTarget {
            dashboardId?: number; // int64
            unsavedDashboard?: Json;
            version?: number; // int64
        }
        /**
         * A Certificate represents an X.509 certificate.
         */
        export interface Certificate {
            AuthorityKeyId?: number /* uint8 */[];
            /**
             * BasicConstraintsValid indicates whether IsCA, MaxPathLen,
             * and MaxPathLenZero are valid.
             */
            BasicConstraintsValid?: boolean;
            /**
             * CRL Distribution Points
             */
            CRLDistributionPoints?: string[];
            /**
             * Subject Alternate Name values. (Note that these values may not be valid
             * if invalid values were contained within a parsed certificate. For
             * example, an element of DNSNames may not be a valid DNS domain name.)
             */
            DNSNames?: string[];
            EmailAddresses?: string[];
            ExcludedDNSDomains?: string[];
            ExcludedEmailAddresses?: string[];
            ExcludedIPRanges?: /* An IPNet represents an IP network. */ IPNet[];
            ExcludedURIDomains?: string[];
            ExtKeyUsage?: /**
             * ExtKeyUsage represents an extended set of actions that are valid for a given key.
             * Each of the ExtKeyUsage* constants define a unique action.
             */
            ExtKeyUsage /* int64 */[];
            /**
             * Extensions contains raw X.509 extensions. When parsing certificates,
             * this can be used to extract non-critical extensions that are not
             * parsed by this package. When marshaling certificates, the Extensions
             * field is ignored, see ExtraExtensions.
             */
            Extensions?: /**
             * Extension represents the ASN.1 structure of the same name. See RFC
             * 5280, section 4.2.
             */
            Extension[];
            /**
             * ExtraExtensions contains extensions to be copied, raw, into any
             * marshaled certificates. Values override any extensions that would
             * otherwise be produced based on the other fields. The ExtraExtensions
             * field is not populated when parsing certificates, see Extensions.
             */
            ExtraExtensions?: /**
             * Extension represents the ASN.1 structure of the same name. See RFC
             * 5280, section 4.2.
             */
            Extension[];
            IPAddresses?: string[];
            /**
             * InhibitAnyPolicy and InhibitAnyPolicyZero indicate the presence and value
             * of the inhibitAnyPolicy extension.
             *
             * The value of InhibitAnyPolicy indicates the number of additional
             * certificates in the path after this certificate that may use the
             * anyPolicy policy OID to indicate a match with any other policy.
             *
             * When parsing a certificate, a positive non-zero InhibitAnyPolicy means
             * that the field was specified, -1 means it was unset, and
             * InhibitAnyPolicyZero being true mean that the field was explicitly set to
             * zero. The case of InhibitAnyPolicy==0 with InhibitAnyPolicyZero==false
             * should be treated equivalent to -1 (unset).
             */
            InhibitAnyPolicy?: number; // int64
            /**
             * InhibitAnyPolicyZero indicates that InhibitAnyPolicy==0 should be
             * interpreted as an actual maximum path length of zero. Otherwise, that
             * combination is interpreted as InhibitAnyPolicy not being set.
             */
            InhibitAnyPolicyZero?: boolean;
            /**
             * InhibitPolicyMapping and InhibitPolicyMappingZero indicate the presence
             * and value of the inhibitPolicyMapping field of the policyConstraints
             * extension.
             *
             * The value of InhibitPolicyMapping indicates the number of additional
             * certificates in the path after this certificate that may use policy
             * mapping.
             *
             * When parsing a certificate, a positive non-zero InhibitPolicyMapping
             * means that the field was specified, -1 means it was unset, and
             * InhibitPolicyMappingZero being true mean that the field was explicitly
             * set to zero. The case of InhibitPolicyMapping==0 with
             * InhibitPolicyMappingZero==false should be treated equivalent to -1
             * (unset).
             */
            InhibitPolicyMapping?: number; // int64
            /**
             * InhibitPolicyMappingZero indicates that InhibitPolicyMapping==0 should be
             * interpreted as an actual maximum path length of zero. Otherwise, that
             * combination is interpreted as InhibitAnyPolicy not being set.
             */
            InhibitPolicyMappingZero?: boolean;
            IsCA?: boolean;
            Issuer?: /**
             * Name represents an X.509 distinguished name. This only includes the common
             * elements of a DN. Note that Name is only an approximation of the X.509
             * structure. If an accurate representation is needed, asn1.Unmarshal the raw
             * subject or issuer as an [RDNSequence].
             */
            Name;
            IssuingCertificateURL?: string[];
            KeyUsage?: /**
             * KeyUsage represents the set of actions that are valid for a given key. It's
             * a bitmap of the KeyUsage* constants.
             */
            KeyUsage /* int64 */;
            /**
             * MaxPathLen and MaxPathLenZero indicate the presence and
             * value of the BasicConstraints' "pathLenConstraint".
             *
             * When parsing a certificate, a positive non-zero MaxPathLen
             * means that the field was specified, -1 means it was unset,
             * and MaxPathLenZero being true mean that the field was
             * explicitly set to zero. The case of MaxPathLen==0 with MaxPathLenZero==false
             * should be treated equivalent to -1 (unset).
             *
             * When generating a certificate, an unset pathLenConstraint
             * can be requested with either MaxPathLen == -1 or using the
             * zero value for both MaxPathLen and MaxPathLenZero.
             */
            MaxPathLen?: number; // int64
            /**
             * MaxPathLenZero indicates that BasicConstraintsValid==true
             * and MaxPathLen==0 should be interpreted as an actual
             * maximum path length of zero. Otherwise, that combination is
             * interpreted as MaxPathLen not being set.
             */
            MaxPathLenZero?: boolean;
            NotBefore?: string; // date-time
            /**
             * RFC 5280, 4.2.2.1 (Authority Information Access)
             */
            OCSPServer?: string[];
            PermittedDNSDomains?: string[];
            /**
             * Name constraints
             */
            PermittedDNSDomainsCritical?: boolean;
            PermittedEmailAddresses?: string[];
            PermittedIPRanges?: /* An IPNet represents an IP network. */ IPNet[];
            PermittedURIDomains?: string[];
            /**
             * Policies contains all policy identifiers included in the certificate.
             * See CreateCertificate for context about how this field and the PolicyIdentifiers field
             * interact.
             * In Go 1.22, encoding/gob cannot handle and ignores this field.
             */
            Policies?: string[];
            /**
             * PolicyIdentifiers contains asn1.ObjectIdentifiers, the components
             * of which are limited to int32. If a certificate contains a policy which
             * cannot be represented by asn1.ObjectIdentifier, it will not be included in
             * PolicyIdentifiers, but will be present in Policies, which contains all parsed
             * policy OIDs.
             * See CreateCertificate for context about how this field and the Policies field
             * interact.
             */
            PolicyIdentifiers?: /* An ObjectIdentifier represents an ASN.1 OBJECT IDENTIFIER. */ ObjectIdentifier[];
            /**
             * PolicyMappings contains a list of policy mappings included in the certificate.
             */
            PolicyMappings?: /* PolicyMapping represents a policy mapping entry in the policyMappings extension. */ PolicyMapping[];
            PublicKey?: any;
            PublicKeyAlgorithm?: PublicKeyAlgorithm /* int64 */;
            Raw?: number /* uint8 */[];
            RawIssuer?: number /* uint8 */[];
            RawSubject?: number /* uint8 */[];
            RawSubjectPublicKeyInfo?: number /* uint8 */[];
            RawTBSCertificate?: number /* uint8 */[];
            /**
             * RequireExplicitPolicy and RequireExplicitPolicyZero indicate the presence
             * and value of the requireExplicitPolicy field of the policyConstraints
             * extension.
             *
             * The value of RequireExplicitPolicy indicates the number of additional
             * certificates in the path after this certificate before an explicit policy
             * is required for the rest of the path. When an explicit policy is required,
             * each subsequent certificate in the path must contain a required policy OID,
             * or a policy OID which has been declared as equivalent through the policy
             * mapping extension.
             *
             * When parsing a certificate, a positive non-zero RequireExplicitPolicy
             * means that the field was specified, -1 means it was unset, and
             * RequireExplicitPolicyZero being true mean that the field was explicitly
             * set to zero. The case of RequireExplicitPolicy==0 with
             * RequireExplicitPolicyZero==false should be treated equivalent to -1
             * (unset).
             */
            RequireExplicitPolicy?: number; // int64
            /**
             * RequireExplicitPolicyZero indicates that RequireExplicitPolicy==0 should be
             * interpreted as an actual maximum path length of zero. Otherwise, that
             * combination is interpreted as InhibitAnyPolicy not being set.
             */
            RequireExplicitPolicyZero?: boolean;
            SerialNumber?: string;
            Signature?: number /* uint8 */[];
            SignatureAlgorithm?: SignatureAlgorithm /* int64 */;
            Subject?: /**
             * Name represents an X.509 distinguished name. This only includes the common
             * elements of a DN. Note that Name is only an approximation of the X.509
             * structure. If an accurate representation is needed, asn1.Unmarshal the raw
             * subject or issuer as an [RDNSequence].
             */
            Name;
            SubjectKeyId?: number /* uint8 */[];
            URIs?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL[];
            /**
             * UnhandledCriticalExtensions contains a list of extension IDs that
             * were not (fully) processed when parsing. Verify will fail if this
             * slice is non-empty, unless verification is delegated to an OS
             * library which understands all the critical extensions.
             *
             * Users can access these extensions using Extensions and can remove
             * elements from this slice if they believe that they have been
             * handled.
             */
            UnhandledCriticalExtensions?: /* An ObjectIdentifier represents an ASN.1 OBJECT IDENTIFIER. */ ObjectIdentifier[];
            UnknownExtKeyUsage?: /* An ObjectIdentifier represents an ASN.1 OBJECT IDENTIFIER. */ ObjectIdentifier[];
            Version?: number; // int64
        }
        export interface ChangeUserPasswordCommand {
            newPassword?: Password;
            oldPassword?: Password;
        }
        export interface CloudMigrationRunListDTO {
            runs?: MigrateDataResponseListDTO[];
        }
        export interface CloudMigrationSessionListResponseDTO {
            sessions?: CloudMigrationSessionResponseDTO[];
        }
        export interface CloudMigrationSessionRequestDTO {
            authToken?: string;
        }
        export interface CloudMigrationSessionResponseDTO {
            created?: string; // date-time
            slug?: string;
            uid?: string;
            updated?: string; // date-time
        }
        /**
         * ClusterStatus cluster status
         */
        export interface ClusterStatus {
            /**
             * name
             */
            name?: string;
            /**
             * peers
             */
            peers?: /* PeerStatus peer status */ PeerStatus[];
            /**
             * status
             */
            status: "[ready settling disabled]";
        }
        /**
         * ConfFloat64 is a float64. It Marshals float64 values of NaN of Inf
         * to null.
         */
        export type ConfFloat64 = number; // double
        /**
         * Config is the top-level configuration for Alertmanager's config files.
         */
        export interface Config {
            global?: /**
             * GlobalConfig defines configuration parameters that are valid globally
             * unless overwritten.
             */
            GlobalConfig;
            inhibit_rules?: /**
             * InhibitRule defines an inhibition rule that mutes alerts that match the
             * target labels if an alert matching the source labels exists.
             * Both alerts have to have a set of labels being equal.
             */
            InhibitRule[];
            /**
             * MuteTimeIntervals is deprecated and will be removed before Alertmanager 1.0.
             */
            mute_time_intervals?: /* MuteTimeInterval represents a named set of time intervals for which a route should be muted. */ MuteTimeInterval[];
            route?: /**
             * A Route is a node that contains definitions of how to handle alerts. This is modified
             * from the upstream alertmanager in that it adds the ObjectMatchers property.
             */
            Route;
            templates?: string[];
            time_intervals?: /* TimeInterval represents a named set of time intervals for which a route should be muted. */ TimeInterval[];
        }
        /**
         * ContactPointExport is the provisioned file export of alerting.ContactPointV1.
         */
        export interface ContactPointExport {
            name?: string;
            orgId?: number; // int64
            receivers?: /* ReceiverExport is the provisioned file export of alerting.ReceiverV1. */ ReceiverExport[];
        }
        export type ContactPoints = /**
         * EmbeddedContactPoint is the contact point type that is used
         * by grafanas embedded alertmanager implementation.
         */
        EmbeddedContactPoint[];
        export interface ConvertPrometheusResponse {
            error?: string;
            errorType?: string;
            status?: string;
        }
        export interface CookiePreferences {
            analytics?: any;
            functional?: any;
            performance?: any;
        }
        export type CookieType = string;
        /**
         * Correlation is the model for correlations definitions
         */
        export interface Correlation {
            config?: CorrelationConfig;
            /**
             * Description of the correlation
             * example:
             * Logs to Traces
             */
            description?: string;
            /**
             * Label identifying the correlation
             * example:
             * My Label
             */
            label?: string;
            /**
             * OrgID of the data source the correlation originates from
             * example:
             * 1
             */
            orgId?: number; // int64
            /**
             * Provisioned True if the correlation was created during provisioning
             */
            provisioned?: boolean;
            /**
             * UID of the data source the correlation originates from
             * example:
             * d0oxYRg4z
             */
            sourceUID?: string;
            /**
             * UID of the data source the correlation points to
             * example:
             * PE1C5CBDA0504A6A3
             */
            targetUID?: string;
            type?: /**
             * the type of correlation, either query for containing query information, or external for containing an external URL
             * +enum
             */
            CorrelationType;
            /**
             * Unique identifier of the correlation
             * example:
             * 50xhMlg9k
             */
            uid?: string;
        }
        export interface CorrelationConfig {
            /**
             * Field used to attach the correlation link
             * example:
             * message
             */
            field: string;
            /**
             * Target data query
             * example:
             * {
             *   "prop1": "value1",
             *   "prop2": "value"
             * }
             */
            target: {
                [name: string]: any;
            };
            transformations?: Transformations;
            type?: /**
             * the type of correlation, either query for containing query information, or external for containing an external URL
             * +enum
             */
            CorrelationType;
        }
        export interface CorrelationConfigUpdateDTO {
            /**
             * Field used to attach the correlation link
             * example:
             * message
             */
            field?: string;
            /**
             * Target data query
             * example:
             * {
             *   "prop1": "value1",
             *   "prop2": "value"
             * }
             */
            target?: {
                [name: string]: any;
            };
            /**
             * Source data transformations
             * example:
             * [
             *   {
             *     "type": "logfmt"
             *   },
             *   {
             *     "expression": "(Superman|Batman)",
             *     "type": "regex",
             *     "variable": "name"
             *   }
             * ]
             */
            transformations?: Transformation[];
        }
        /**
         * the type of correlation, either query for containing query information, or external for containing an external URL
         * +enum
         */
        export type CorrelationType = string;
        /**
         * CounterResetHint contains the known information about a counter reset,
         * or alternatively that we are dealing with a gauge histogram, where counter resets do not apply.
         */
        export type CounterResetHint = number; // uint8
        export interface CreateAccessTokenResponseDTO {
            token?: string;
        }
        /**
         * CreateCorrelationCommand is the command for creating a correlation
         */
        export interface CreateCorrelationCommand {
            config?: CorrelationConfig;
            /**
             * Optional description of the correlation
             * example:
             * Logs to Traces
             */
            description?: string;
            /**
             * Optional label identifying the correlation
             * example:
             * My label
             */
            label?: string;
            /**
             * True if correlation was created with provisioning. This makes it read-only.
             */
            provisioned?: boolean;
            /**
             * Target data source UID to which the correlation is created. required if type = query
             * example:
             * PE1C5CBDA0504A6A3
             */
            targetUID?: string;
            type?: /**
             * the type of correlation, either query for containing query information, or external for containing an external URL
             * +enum
             */
            CorrelationType;
        }
        /**
         * CreateCorrelationResponse is the response struct for CreateCorrelationCommand
         */
        export interface CreateCorrelationResponseBody {
            /**
             * example:
             * Correlation created
             */
            message?: string;
            result?: /* Correlation is the model for correlations definitions */ Correlation;
        }
        export interface CreateDashboardSnapshotCommand {
            /**
             * APIVersion defines the versioned schema of this representation of an object.
             * Servers should convert recognized schemas to the latest internal value, and
             * may reject unrecognized values.
             * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
             * +optional
             */
            apiVersion?: string;
            dashboard: /**
             * Unstructured allows objects that do not have Golang structs registered to be manipulated
             * generically.
             */
            Unstructured;
            /**
             * Unique key used to delete the snapshot. It is different from the `key` so that only the creator can delete the snapshot. Required if `external` is `true`.
             */
            deleteKey?: string;
            /**
             * When the snapshot should expire in seconds in seconds. Default is never to expire.
             */
            expires?: number; // int64
            /**
             * these are passed when storing an external snapshot ref
             * Save the snapshot on an external server rather than locally.
             */
            external?: boolean;
            /**
             * Define the unique key. Required if `external` is `true`.
             */
            key?: string;
            /**
             * Kind is a string value representing the REST resource this object represents.
             * Servers may infer this from the endpoint the client submits requests to.
             * Cannot be updated.
             * In CamelCase.
             * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
             * +optional
             */
            kind?: string;
            /**
             * Snapshot name
             */
            name?: string;
        }
        /**
         * CreateFolderCommand captures the information required by the folder service
         * to create a folder.
         */
        export interface CreateFolderCommand {
            description?: string;
            parentUid?: string;
            title?: string;
            uid?: string;
        }
        /**
         * CreateLibraryElementCommand is the command for adding a LibraryElement
         */
        export interface CreateLibraryElementCommand {
            /**
             * ID of the folder where the library element is stored.
             *
             * Deprecated: use FolderUID instead
             */
            folderId?: number; // int64
            /**
             * UID of the folder where the library element is stored.
             */
            folderUid?: string;
            /**
             * Kind of element to create, Use 1 for library panels or 2 for c.
             * Description:
             * 1 - library panels
             * 2 - library variables
             */
            kind?: 1 | 2; // int64
            /**
             * The JSON model for the library element.
             */
            model?: {
                [key: string]: any;
            };
            /**
             * Name of the library element.
             */
            name?: string;
            uid?: string;
        }
        export interface CreateOrUpdateReport {
            dashboards?: ReportDashboard[];
            enableCsv?: boolean;
            enableDashboardUrl?: boolean;
            formats?: /* +enum */ Type[];
            message?: string;
            name?: string;
            options?: ReportOptions;
            recipients?: string;
            replyTo?: string;
            scaleFactor?: number; // int64
            schedule?: ReportSchedule;
            state?: /* +enum */ State;
            subject?: string;
        }
        export interface CreateOrgCommand {
            name?: string;
        }
        export interface CreatePlaylistCommand {
            interval?: string;
            items?: PlaylistItem[];
            name?: string;
        }
        /**
         * CreateQueryInQueryHistoryCommand is the command for adding query history
         */
        export interface CreateQueryInQueryHistoryCommand {
            /**
             * UID of the data source for which are queries stored.
             * example:
             * PE1C5CBDA0504A6A3
             */
            datasourceUid?: string;
            queries: Json;
        }
        export interface CreateRoleForm {
            description?: string;
            displayName?: string;
            global?: boolean;
            group?: string;
            hidden?: boolean;
            name?: string;
            permissions?: /* Permission is the model for access control permissions. */ Permission[];
            uid?: string;
            version?: number; // int64
        }
        export interface CreateServiceAccountForm {
            /**
             * example:
             * false
             */
            isDisabled?: boolean;
            /**
             * example:
             * grafana
             */
            name?: string;
            /**
             * example:
             * Admin
             */
            role?: "None" | "Viewer" | "Editor" | "Admin";
        }
        export interface CreateSnapshotResponseDTO {
            uid?: string;
        }
        export interface CreateTeamCommand {
            email?: string;
            name?: string;
        }
        export interface DashboardACLInfoDTO {
            created?: string; // date-time
            dashboardId?: number; // int64
            /**
             * Deprecated: use FolderUID instead
             */
            folderId?: number; // int64
            folderUid?: string;
            inherited?: boolean;
            isFolder?: boolean;
            permission?: PermissionType /* int64 */;
            permissionName?: string;
            role?: "None" | "Viewer" | "Editor" | "Admin";
            slug?: string;
            team?: string;
            teamAvatarUrl?: string;
            teamEmail?: string;
            teamId?: number; // int64
            teamUid?: string;
            title?: string;
            uid?: string;
            updated?: string; // date-time
            url?: string;
            userAvatarUrl?: string;
            userEmail?: string;
            userId?: number; // int64
            userLogin?: string;
            userUid?: string;
        }
        export interface DashboardACLUpdateItem {
            permission?: PermissionType /* int64 */;
            role?: "None" | "Viewer" | "Editor" | "Admin";
            teamId?: number; // int64
            userId?: number; // int64
        }
        /**
         * These are the values expected to be sent from an end user
         * +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object
         */
        export interface DashboardCreateCommand {
            /**
             * APIVersion defines the versioned schema of this representation of an object.
             * Servers should convert recognized schemas to the latest internal value, and
             * may reject unrecognized values.
             * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
             * +optional
             */
            apiVersion?: string;
            dashboard: /**
             * Unstructured allows objects that do not have Golang structs registered to be manipulated
             * generically.
             */
            Unstructured;
            /**
             * When the snapshot should expire in seconds in seconds. Default is never to expire.
             */
            expires?: number; // int64
            /**
             * these are passed when storing an external snapshot ref
             * Save the snapshot on an external server rather than locally.
             */
            external?: boolean;
            /**
             * Kind is a string value representing the REST resource this object represents.
             * Servers may infer this from the endpoint the client submits requests to.
             * Cannot be updated.
             * In CamelCase.
             * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
             * +optional
             */
            kind?: string;
            /**
             * Snapshot name
             */
            name?: string;
        }
        export interface DashboardFullWithMeta {
            dashboard?: Json;
            meta?: DashboardMeta;
        }
        export interface DashboardMeta {
            annotationsPermissions?: /* +k8s:deepcopy-gen=true */ AnnotationPermission;
            apiVersion?: string;
            canAdmin?: boolean;
            canDelete?: boolean;
            canEdit?: boolean;
            canSave?: boolean;
            canStar?: boolean;
            created?: string; // date-time
            createdBy?: string;
            expires?: string; // date-time
            /**
             * Deprecated: use FolderUID instead
             */
            folderId?: number; // int64
            folderTitle?: string;
            folderUid?: string;
            folderUrl?: string;
            hasAcl?: boolean;
            isFolder?: boolean;
            isSnapshot?: boolean;
            isStarred?: boolean;
            provisioned?: boolean;
            provisionedExternalId?: string;
            publicDashboardEnabled?: boolean;
            slug?: string;
            type?: string;
            updated?: string; // date-time
            updatedBy?: string;
            url?: string;
            version?: number; // int64
        }
        export interface DashboardRedirect {
            redirectUri?: string;
        }
        /**
         * DashboardSnapshotDTO without dashboard map
         */
        export interface DashboardSnapshotDTO {
            created?: string; // date-time
            expires?: string; // date-time
            external?: boolean;
            externalUrl?: string;
            key?: string;
            name?: string;
            updated?: string; // date-time
        }
        export interface DashboardTagCloudItem {
            count?: number; // int64
            term?: string;
        }
        /**
         * DashboardVersionMeta extends the DashboardVersionDTO with the names
         * associated with the UserIds, overriding the field with the same name from
         * the DashboardVersionDTO model.
         */
        export interface DashboardVersionMeta {
            created?: string; // date-time
            createdBy?: string;
            dashboardId?: number; // int64
            data?: Json;
            id?: number; // int64
            message?: string;
            parentVersion?: number; // int64
            restoredFrom?: number; // int64
            uid?: string;
            version?: number; // int64
        }
        /**
         * DataLink define what
         */
        export interface DataLink {
            internal?: /* InternalDataLink definition to allow Explore links to be constructed in the backend */ InternalDataLink;
            targetBlank?: boolean;
            title?: string;
            url?: string;
        }
        /**
         * DataResponse contains the results from a DataQuery.
         * A map of RefIDs (unique query identifiers) to this type makes up the Responses property of a QueryDataResponse.
         * The Error property is used to allow for partial success responses from the containing QueryDataResponse.
         */
        export interface DataResponse {
            /**
             * Error is a property to be set if the corresponding DataQuery has an error.
             */
            Error?: string;
            ErrorSource?: /* Source type defines the status source. */ Source;
            Frames?: /**
             * Frames is a slice of Frame pointers.
             * It is the main data container within a backend.DataResponse.
             * There should be no `nil` entries in the Frames slice (making them pointers was a mistake).
             */
            Frames;
            Status?: Status /* int64 */;
        }
        export interface DataSource {
            access?: DsAccess;
            accessControl?: /**
             * Metadata contains user accesses for a given resource
             * Ex: map[string]bool{"create":true, "delete": true}
             */
            Metadata;
            basicAuth?: boolean;
            basicAuthUser?: string;
            database?: string;
            id?: number; // int64
            isDefault?: boolean;
            jsonData?: Json;
            name?: string;
            orgId?: number; // int64
            readOnly?: boolean;
            secureJsonFields?: {
                [name: string]: boolean;
            };
            type?: string;
            typeLogoUrl?: string;
            uid?: string;
            url?: string;
            user?: string;
            version?: number; // int64
            withCredentials?: boolean;
        }
        export type DataSourceList = DataSourceListItemDTO[];
        export interface DataSourceListItemDTO {
            access?: DsAccess;
            basicAuth?: boolean;
            database?: string;
            id?: number; // int64
            isDefault?: boolean;
            jsonData?: Json;
            name?: string;
            orgId?: number; // int64
            readOnly?: boolean;
            type?: string;
            typeLogoUrl?: string;
            typeName?: string;
            uid?: string;
            url?: string;
            user?: string;
        }
        /**
         * Ref to a DataSource instance
         */
        export interface DataSourceRef {
            /**
             * The plugin type-id
             */
            type?: string;
            /**
             * Specific datasource instance
             */
            uid?: string;
        }
        /**
         * DataTopic is used to identify which topic the frame should be assigned to.
         * nolint:revive
         */
        export type DataTopic = string;
        export interface DeleteCorrelationResponseBody {
            /**
             * example:
             * Correlation deleted
             */
            message?: string;
        }
        export interface DeleteTokenCommand {
            instance?: string;
        }
        export interface DescendantCounts {
            [name: string]: number; // int64
        }
        export interface Description {
            assignments?: Assignments;
            permissions?: string[];
        }
        export interface DeviceDTO {
            avatarUrl?: string;
            clientIp?: string;
            createdAt?: string; // date-time
            deviceId?: string;
            lastSeenAt?: string;
            updatedAt?: string; // date-time
            userAgent?: string;
        }
        export interface DeviceSearchHitDTO {
            clientIp?: string;
            createdAt?: string; // date-time
            deviceId?: string;
            lastSeenAt?: string; // date-time
            updatedAt?: string; // date-time
            userAgent?: string;
        }
        /**
         * DiscordConfig configures notifications via Discord.
         */
        export interface DiscordConfig {
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            message?: string;
            send_resolved?: boolean;
            title?: string;
            webhook_url?: SecretURL;
            webhook_url_file?: string;
        }
        export interface DiscoveryBase {
            error?: string;
            errorType?: /* ErrorType models the different API error types. */ ErrorType;
            status: string;
        }
        export type DsAccess = string;
        /**
         * Datasource permission
         * Description:
         * `0` - No Access
         * `1` - Query
         * `2` - Edit
         * Enum: 0,1,2
         */
        export type DsPermissionType = number; // int64
        /**
         * A Duration represents the elapsed time between two instants
         * as an int64 nanosecond count. The representation limits the
         * largest representable duration to approximately 290 years.
         */
        export type Duration = number; // int64
        /**
         * EmailConfig configures notifications via mail.
         */
        export interface EmailConfig {
            auth_identity?: string;
            auth_password?: /* Secret special type for storing secrets. */ Secret;
            auth_password_file?: string;
            auth_secret?: /* Secret special type for storing secrets. */ Secret;
            auth_username?: string;
            from?: string;
            headers?: {
                [name: string]: string;
            };
            hello?: string;
            html?: string;
            require_tls?: boolean;
            send_resolved?: boolean;
            smarthost?: /* HostPort represents a "host:port" network address. */ HostPort;
            text?: string;
            tls_config?: /* TLSConfig configures the options for TLS connections. */ TLSConfig;
            /**
             * Email address to notify.
             */
            to?: string;
        }
        export interface EmailDTO {
            recipient?: string;
            uid?: string;
        }
        /**
         * EmbeddedContactPoint is the contact point type that is used
         * by grafanas embedded alertmanager implementation.
         */
        export interface EmbeddedContactPoint {
            /**
             * example:
             * false
             */
            disableResolveMessage?: boolean;
            /**
             * Name is used as grouping key in the UI. Contact points with the
             * same name will be grouped in the UI.
             * example:
             * webhook_1
             */
            name?: string;
            provenance?: string;
            settings: Json;
            /**
             * example:
             * webhook
             */
            type: "alertmanager" | "dingding" | "discord" | "email" | "googlechat" | "kafka" | "line" | "opsgenie" | "pagerduty" | "pushover" | "sensugo" | "slack" | "teams" | "telegram" | "threema" | "victorops" | "webhook" | "wecom";
            /**
             * UID is the unique identifier of the contact point. The UID can be
             * set by the user.
             * example:
             * my_external_reference
             */
            uid?: string; // ^[a-zA-Z0-9\-\_]+$
        }
        /**
         * Enum field config
         * Vector values are used as lookup keys into the enum fields
         */
        export interface EnumFieldConfig {
            /**
             * Color is the color value for a given index (empty is undefined)
             */
            color?: string[];
            /**
             * Description of the enum state
             */
            description?: string[];
            /**
             * Icon supports setting an icon for a given index value
             */
            icon?: string[];
            /**
             * Value is the string display value for a given index
             */
            text?: string[];
        }
        export interface ErrorResponseBody {
            /**
             * Error An optional detailed description of the actual error. Only included if running in developer mode.
             */
            error?: string;
            /**
             * a human readable version of the error
             */
            message: string;
            /**
             * Status An optional status to denote the cause of the error.
             *
             * For example, a 412 Precondition Failed error may include additional information of why that error happened.
             */
            status?: string;
        }
        /**
         * ErrorType models the different API error types.
         */
        export type ErrorType = string;
        /**
         * EvalAlertConditionCommand is the command for evaluating a condition
         */
        export interface EvalAlertConditionCommand {
            condition?: string;
            data?: /* AlertQuery represents a single query associated with an alert definition. */ AlertQuery[];
            now?: string; // date-time
        }
        export interface EvalQueriesPayload {
            condition?: string;
            data?: /* AlertQuery represents a single query associated with an alert definition. */ AlertQuery[];
            now?: string; // date-time
        }
        export interface EvalQueriesResponse {
        }
        /**
         * This is an object constructed with the keys as the values of the enum VisType and the value being a bag of properties
         */
        export type ExplorePanelsState = any;
        /**
         * ExtKeyUsage represents an extended set of actions that are valid for a given key.
         * Each of the ExtKeyUsage* constants define a unique action.
         */
        export type ExtKeyUsage = number; // int64
        export interface ExtendedReceiver {
            email_configs?: /* EmailConfig configures notifications via mail. */ EmailConfig;
            grafana_managed_receiver?: PostableGrafanaReceiver;
            opsgenie_configs?: /* OpsGenieConfig configures notifications via OpsGenie. */ OpsGenieConfig;
            pagerduty_configs?: /* PagerdutyConfig configures notifications via PagerDuty. */ PagerdutyConfig;
            pushover_configs?: PushoverConfig;
            slack_configs?: /* SlackConfig configures notifications via Slack. */ SlackConfig;
            victorops_configs?: /* VictorOpsConfig configures notifications via VictorOps. */ VictorOpsConfig;
            webhook_configs?: /* WebhookConfig configures notifications via a generic webhook. */ WebhookConfig;
            wechat_configs?: /* WechatConfig configures notifications via Wechat. */ WechatConfig;
        }
        /**
         * Extension represents the ASN.1 structure of the same name. See RFC
         * 5280, section 4.2.
         */
        export interface Extension {
            Critical?: boolean;
            Id?: /* An ObjectIdentifier represents an ASN.1 OBJECT IDENTIFIER. */ ObjectIdentifier;
            Value?: number /* uint8 */[];
        }
        /**
         * FailedUser holds the information of an user that failed
         */
        export interface FailedUser {
            Error?: string;
            Login?: string;
        }
        export type Failure = ResponseDetails;
        /**
         * Field represents a typed column of data within a Frame.
         * A Field is essentially a slice of various types with extra properties and methods.
         * See NewField() for supported types.
         *
         * The slice data in the Field is a not exported, so methods on the Field are used to to manipulate its data.
         */
        export interface Field {
            config?: /* FieldConfig represents the display properties for a Field. */ FieldConfig;
            labels?: /* Labels are used to add metadata to an object.  The JSON will always be sorted keys */ FrameLabels;
            /**
             * Name is default identifier of the field. The name does not have to be unique, but the combination
             * of name and Labels should be unique for proper behavior in all situations.
             */
            name?: string;
        }
        /**
         * FieldConfig represents the display properties for a Field.
         */
        export interface FieldConfig {
            /**
             * Map values to a display color
             * NOTE: this interface is under development in the frontend... so simple map for now
             */
            color?: {
                [name: string]: any;
            };
            /**
             * Panel Specific Values
             */
            custom?: {
                [name: string]: any;
            };
            decimals?: number; // uint16
            /**
             * Description is human readable field metadata
             */
            description?: string;
            /**
             * DisplayName overrides Grafana default naming, should not be used from a data source
             */
            displayName?: string;
            /**
             * DisplayNameFromDS overrides Grafana default naming strategy.
             */
            displayNameFromDS?: string;
            /**
             * Filterable indicates if the Field's data can be filtered by additional calls.
             */
            filterable?: boolean;
            /**
             * Interval indicates the expected regular step between values in the series.
             * When an interval exists, consumers can identify "missing" values when the expected value is not present.
             * The grafana timeseries visualization will render disconnected values when missing values are found it the time field.
             * The interval uses the same units as the values.  For time.Time, this is defined in milliseconds.
             */
            interval?: number; // double
            /**
             * The behavior when clicking on a result
             */
            links?: /* DataLink define what */ DataLink[];
            mappings?: ValueMappings;
            max?: /**
             * ConfFloat64 is a float64. It Marshals float64 values of NaN of Inf
             * to null.
             */
            ConfFloat64 /* double */;
            min?: /**
             * ConfFloat64 is a float64. It Marshals float64 values of NaN of Inf
             * to null.
             */
            ConfFloat64 /* double */;
            /**
             * Alternative to empty string
             */
            noValue?: string;
            /**
             * Path is an explicit path to the field in the datasource. When the frame meta includes a path,
             * this will default to `${frame.meta.path}/${field.name}
             *
             * When defined, this value can be used as an identifier within the datasource scope, and
             * may be used as an identifier to update values in a subsequent request
             */
            path?: string;
            thresholds?: /* ThresholdsConfig setup thresholds */ ThresholdsConfig;
            type?: /* FieldTypeConfig has type specific configs, only one should be active at a time */ FieldTypeConfig;
            /**
             * Numeric Options
             */
            unit?: string;
            /**
             * Writeable indicates that the datasource knows how to update this value
             */
            writeable?: boolean;
        }
        /**
         * FieldTypeConfig has type specific configs, only one should be active at a time
         */
        export interface FieldTypeConfig {
            enum?: /**
             * Enum field config
             * Vector values are used as lookup keys into the enum fields
             */
            EnumFieldConfig;
        }
        /**
         * FindTagsResult is the result of a tags search.
         */
        export interface FindTagsResult {
            tags?: /* TagsDTO is the frontend DTO for Tag. */ TagsDTO[];
        }
        /**
         * FloatHistogram is similar to Histogram but uses float64 for all
         * counts. Additionally, bucket counts are absolute and not deltas.
         * A FloatHistogram is needed by PromQL to handle operations that might result
         * in fractional counts. Since the counts in a histogram are unlikely to be too
         * large to be represented precisely by a float64, a FloatHistogram can also be
         * used to represent a histogram with integer counts and thus serves as a more
         * generalized representation.
         */
        export interface FloatHistogram {
            /**
             * Total number of observations. Must be zero or positive.
             */
            Count?: number; // double
            CounterResetHint?: /**
             * CounterResetHint contains the known information about a counter reset,
             * or alternatively that we are dealing with a gauge histogram, where counter resets do not apply.
             */
            CounterResetHint /* uint8 */;
            /**
             * Holds the custom (usually upper) bounds for bucket definitions, otherwise nil.
             * This slice is interned, to be treated as immutable and copied by reference.
             * These numbers should be strictly increasing. This field is only used when the
             * schema is for custom buckets, and the ZeroThreshold, ZeroCount, NegativeSpans
             * and NegativeBuckets fields are not used in that case.
             */
            CustomValues?: number /* double */[];
            /**
             * Observation counts in buckets. Each represents an absolute count and
             * must be zero or positive.
             */
            PositiveBuckets?: number /* double */[];
            /**
             * Spans for positive and negative buckets (see Span below).
             */
            PositiveSpans?: /* A Span defines a continuous sequence of buckets. */ Span[];
            /**
             * Currently valid schema numbers are -4 <= n <= 8 for exponential buckets.
             * They are all for base-2 bucket schemas, where 1 is a bucket boundary in
             * each case, and then each power of two is divided into 2^n logarithmic buckets.
             * Or in other words, each bucket boundary is the previous boundary times
             * 2^(2^-n). Another valid schema number is -53 for custom buckets, defined by
             * the CustomValues field.
             */
            Schema?: number; // int32
            /**
             * Sum of observations. This is also used as the stale marker.
             */
            Sum?: number; // double
            /**
             * Observations falling into the zero bucket. Must be zero or positive.
             */
            ZeroCount?: number; // double
            /**
             * Width of the zero bucket.
             */
            ZeroThreshold?: number; // double
        }
        export interface Folder {
            accessControl?: /**
             * Metadata contains user accesses for a given resource
             * Ex: map[string]bool{"create":true, "delete": true}
             */
            Metadata;
            canAdmin?: boolean;
            canDelete?: boolean;
            canEdit?: boolean;
            canSave?: boolean;
            created?: string; // date-time
            createdBy?: string;
            hasAcl?: boolean;
            /**
             * Deprecated: use UID instead
             */
            id?: number; // int64
            managedBy?: /**
             * ManagerKind is the type of manager, which is responsible for managing the resource.
             * It can be a user or a tool or a generic API client.
             * +enum
             */
            ManagerKind;
            orgId?: number; // int64
            /**
             * only used if nested folders are enabled
             */
            parentUid?: string;
            /**
             * the parent folders starting from the root going down
             */
            parents?: Folder[];
            title?: string;
            uid?: string;
            updated?: string; // date-time
            updatedBy?: string;
            url?: string;
            version?: number; // int64
        }
        export interface FolderSearchHit {
            id?: number; // int64
            managedBy?: /**
             * ManagerKind is the type of manager, which is responsible for managing the resource.
             * It can be a user or a tool or a generic API client.
             * +enum
             */
            ManagerKind;
            parentUid?: string;
            title?: string;
            uid?: string;
        }
        export interface ForbiddenError {
            body?: /**
             * PublicError is derived from Error and only contains information
             * available to the end user.
             */
            PublicError;
        }
        /**
         * Frame is a columnar data structure where each column is a Field.
         * Each Field is well typed by its FieldType and supports optional Labels.
         *
         * A Frame is a general data container for Grafana. A Frame can be table data
         * or time series data depending on its content and field types.
         */
        export interface Frame {
            /**
             * Fields are the columns of a frame.
             * All Fields must be of the same the length when marshalling the Frame for transmission.
             * There should be no `nil` entries in the Fields slice (making them pointers was a mistake).
             */
            Fields?: /**
             * Field represents a typed column of data within a Frame.
             * A Field is essentially a slice of various types with extra properties and methods.
             * See NewField() for supported types.
             *
             * The slice data in the Field is a not exported, so methods on the Field are used to to manipulate its data.
             */
            Field[];
            Meta?: /**
             * FrameMeta matches:
             * https://github.com/grafana/grafana/blob/master/packages/grafana-data/src/types/data.ts#L11
             * NOTE -- in javascript this can accept any `[key: string]: any;` however
             * this interface only exposes the values we want to be exposed
             */
            FrameMeta;
            /**
             * Name is used in some Grafana visualizations.
             */
            Name?: string;
            /**
             * RefID is a property that can be set to match a Frame to its originating query.
             */
            RefID?: string;
        }
        /**
         * Labels are used to add metadata to an object.  The JSON will always be sorted keys
         */
        export interface FrameLabels {
            [name: string]: string;
        }
        /**
         * FrameMeta matches:
         * https://github.com/grafana/grafana/blob/master/packages/grafana-data/src/types/data.ts#L11
         * NOTE -- in javascript this can accept any `[key: string]: any;` however
         * this interface only exposes the values we want to be exposed
         */
        export interface FrameMeta {
            /**
             * Channel is the path to a stream in grafana live that has real-time updates for this data.
             */
            channel?: string;
            /**
             * Custom datasource specific values.
             */
            custom?: any;
            dataTopic?: /**
             * DataTopic is used to identify which topic the frame should be assigned to.
             * nolint:revive
             */
            DataTopic;
            /**
             * ExecutedQueryString is the raw query sent to the underlying system. All macros and templating
             * have been applied.  When metadata contains this value, it will be shown in the query inspector.
             */
            executedQueryString?: string;
            /**
             * Notices provide additional information about the data in the Frame that
             * Grafana can display to the user in the user interface.
             */
            notices?: /* Notice provides a structure for presenting notifications in Grafana's user interface. */ Notice[];
            /**
             * Path is a browsable path on the datasource.
             */
            path?: string;
            /**
             * PathSeparator defines the separator pattern to decode a hierarchy. The default separator is '/'.
             */
            pathSeparator?: string;
            /**
             * PreferredVisualizationPluginId sets the panel plugin id to use to render the data when using Explore. If
             * the plugin cannot be found will fall back to PreferredVisualization.
             */
            preferredVisualisationPluginId?: string;
            preferredVisualisationType?: /* VisType is used to indicate how the data should be visualized in explore. */ VisType;
            /**
             * Stats is an array of query result statistics.
             */
            stats?: /**
             * QueryStat is used for storing arbitrary statistics metadata related to a query and its result, e.g. total request time, data processing time.
             * The embedded FieldConfig's display name must be set.
             * It corresponds to the QueryResultMetaStat on the frontend (https://github.com/grafana/grafana/blob/master/packages/grafana-data/src/types/data.ts#L53).
             */
            QueryStat[];
            type?: /**
             * A FrameType string, when present in a frame's metadata, asserts that the
             * frame's structure conforms to the FrameType's specification.
             * This property is currently optional, so FrameType may be FrameTypeUnknown even if the properties of
             * the Frame correspond to a defined FrameType.
             * +enum
             */
            FrameType;
            typeVersion?: /* FrameType is a 2 number version (Major / Minor). */ FrameTypeVersion;
            /**
             * Array of field indices which values create a unique id for each row. Ideally this should be globally unique ID
             * but that isn't guarantied. Should help with keeping track and deduplicating rows in visualizations, especially
             * with streaming data with frequent updates.
             * example:
             * TraceID in Tempo, table name + primary key in SQL
             */
            uniqueRowIdFields?: number /* int64 */[];
        }
        /**
         * A FrameType string, when present in a frame's metadata, asserts that the
         * frame's structure conforms to the FrameType's specification.
         * This property is currently optional, so FrameType may be FrameTypeUnknown even if the properties of
         * the Frame correspond to a defined FrameType.
         * +enum
         */
        export type FrameType = string;
        /**
         * FrameType is a 2 number version (Major / Minor).
         */
        export type FrameTypeVersion = number /* uint64 */[];
        /**
         * Frames is a slice of Frame pointers.
         * It is the main data container within a backend.DataResponse.
         * There should be no `nil` entries in the Frames slice (making them pointers was a mistake).
         */
        export type Frames = /**
         * Frame is a columnar data structure where each column is a Field.
         * Each Field is well typed by its FieldType and supports optional Labels.
         *
         * A Frame is a general data container for Grafana. A Frame can be table data
         * or time series data depending on its content and field types.
         */
        Frame[];
        export interface GetAccessTokenResponseDTO {
            createdAt?: string;
            displayName?: string;
            expiresAt?: string;
            firstUsedAt?: string;
            id?: string;
            lastUsedAt?: string;
        }
        /**
         * GetAnnotationTagsResponse is a response struct for FindTagsResult.
         */
        export interface GetAnnotationTagsResponse {
            result?: /* FindTagsResult is the result of a tags search. */ FindTagsResult;
        }
        export interface GetGroupsResponse {
            groups?: Group[];
            total?: number; // int64
        }
        /**
         * Get home dashboard response.
         */
        export interface GetHomeDashboardResponse {
            dashboard?: Json;
            meta?: DashboardMeta;
            redirectUri?: string;
        }
        export interface GetSnapshotResponseDTO {
            created?: string; // date-time
            finished?: string; // date-time
            results?: MigrateDataResponseItemDTO[];
            sessionUid?: string;
            stats?: SnapshotResourceStats;
            status?: "INITIALIZING" | "CREATING" | "PENDING_UPLOAD" | "UPLOADING" | "PENDING_PROCESSING" | "PROCESSING" | "FINISHED" | "CANCELED" | "ERROR" | "UNKNOWN";
            uid?: string;
        }
        /**
         * GettableAlert gettable alert
         */
        export interface GettableAlert {
            annotations: /* LabelSet label set */ LabelSet;
            /**
             * ends at
             */
            endsAt: string; // date-time
            /**
             * fingerprint
             */
            fingerprint: string;
            /**
             * generator URL
             * Format: uri
             */
            generatorURL?: string; // uri
            labels: /* LabelSet label set */ LabelSet;
            /**
             * receivers
             */
            receivers: /* Receiver receiver */ Receiver[];
            /**
             * starts at
             */
            startsAt: string; // date-time
            status: /* AlertStatus alert status */ AlertStatus;
            /**
             * updated at
             */
            updatedAt: string; // date-time
        }
        export interface GettableAlertmanagers {
            data?: /* AlertManagersResult contains the result from querying the alertmanagers endpoint. */ AlertManagersResult;
            status?: string;
        }
        /**
         * GettableAlerts gettable alerts
         */
        export type GettableAlerts = /* GettableAlert gettable alert */ GettableAlert[];
        export interface GettableApiAlertingConfig {
            global?: /**
             * GlobalConfig defines configuration parameters that are valid globally
             * unless overwritten.
             */
            GlobalConfig;
            inhibit_rules?: /**
             * InhibitRule defines an inhibition rule that mutes alerts that match the
             * target labels if an alert matching the source labels exists.
             * Both alerts have to have a set of labels being equal.
             */
            InhibitRule[];
            muteTimeProvenances?: {
                [name: string]: Provenance;
            };
            /**
             * MuteTimeIntervals is deprecated and will be removed before Alertmanager 1.0.
             */
            mute_time_intervals?: /* MuteTimeInterval represents a named set of time intervals for which a route should be muted. */ MuteTimeInterval[];
            /**
             * Override with our superset receiver type
             */
            receivers?: GettableApiReceiver[];
            route?: /**
             * A Route is a node that contains definitions of how to handle alerts. This is modified
             * from the upstream alertmanager in that it adds the ObjectMatchers property.
             */
            Route;
            templates?: string[];
            time_intervals?: /* TimeInterval represents a named set of time intervals for which a route should be muted. */ TimeInterval[];
        }
        export interface GettableApiReceiver {
            discord_configs?: /* DiscordConfig configures notifications via Discord. */ DiscordConfig[];
            email_configs?: /* EmailConfig configures notifications via mail. */ EmailConfig[];
            grafana_managed_receiver_configs?: GettableGrafanaReceiver[];
            msteams_configs?: MSTeamsConfig[];
            /**
             * A unique identifier for this receiver.
             */
            name?: string;
            opsgenie_configs?: /* OpsGenieConfig configures notifications via OpsGenie. */ OpsGenieConfig[];
            pagerduty_configs?: /* PagerdutyConfig configures notifications via PagerDuty. */ PagerdutyConfig[];
            pushover_configs?: PushoverConfig[];
            slack_configs?: /* SlackConfig configures notifications via Slack. */ SlackConfig[];
            sns_configs?: SNSConfig[];
            telegram_configs?: /* TelegramConfig configures notifications via Telegram. */ TelegramConfig[];
            victorops_configs?: /* VictorOpsConfig configures notifications via VictorOps. */ VictorOpsConfig[];
            webex_configs?: /* WebexConfig configures notifications via Webex. */ WebexConfig[];
            webhook_configs?: /* WebhookConfig configures notifications via a generic webhook. */ WebhookConfig[];
            wechat_configs?: /* WechatConfig configures notifications via Wechat. */ WechatConfig[];
        }
        export interface GettableExtendedRuleNode {
            alert?: string;
            annotations?: {
                [name: string]: string;
            };
            expr?: string;
            for?: string;
            grafana_alert?: GettableGrafanaRule;
            keep_firing_for?: string;
            labels?: {
                [name: string]: string;
            };
            record?: string;
        }
        export interface GettableGrafanaReceiver {
            disableResolveMessage?: boolean;
            name?: string;
            provenance?: Provenance;
            secureFields?: {
                [name: string]: boolean;
            };
            settings?: RawMessage;
            type?: string;
            uid?: string;
        }
        export interface GettableGrafanaReceivers {
            grafana_managed_receiver_configs?: GettableGrafanaReceiver[];
        }
        export interface GettableGrafanaRule {
            condition?: string;
            data?: /* AlertQuery represents a single query associated with an alert definition. */ AlertQuery[];
            exec_err_state?: "OK" | "Alerting" | "Error";
            guid?: string;
            intervalSeconds?: number; // int64
            is_paused?: boolean;
            metadata?: AlertRuleMetadata;
            namespace_uid?: string;
            no_data_state?: "Alerting" | "NoData" | "OK";
            notification_settings?: AlertRuleNotificationSettings;
            provenance?: Provenance;
            record?: Record;
            rule_group?: string;
            title?: string;
            uid?: string;
            updated?: string; // date-time
            updated_by?: /* UserInfo represents user-related information, including a unique identifier and a name. */ UserInfo;
            version?: number; // int64
        }
        export interface GettableGrafanaSilence {
            /**
             * example:
             * {
             *   "create": false,
             *   "read": true,
             *   "write": false
             * }
             */
            accessControl?: {
                [name: string]: boolean;
            };
            /**
             * comment
             */
            comment: string;
            /**
             * created by
             */
            createdBy: string;
            /**
             * ends at
             */
            endsAt: string; // date-time
            /**
             * id
             */
            id: string;
            matchers: /* Matchers matchers */ Matchers;
            metadata?: SilenceMetadata;
            /**
             * starts at
             */
            startsAt: string; // date-time
            status: /* SilenceStatus silence status */ SilenceStatus;
            /**
             * updated at
             */
            updatedAt: string; // date-time
        }
        export type GettableGrafanaSilences = GettableGrafanaSilence[];
        export interface GettableHistoricUserConfig {
            alertmanager_config?: GettableApiAlertingConfig;
            id?: number; // int64
            last_applied?: string; // date-time
            template_file_provenances?: {
                [name: string]: Provenance;
            };
            template_files?: {
                [name: string]: string;
            };
        }
        export interface GettableNGalertConfig {
            alertmanagersChoice?: "all" | "internal" | "external";
        }
        export interface GettableRuleGroupConfig {
            align_evaluation_time_on_interval?: boolean;
            evaluation_delay?: string;
            interval?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            limit?: number; // int64
            name?: string;
            query_offset?: string;
            rules?: GettableExtendedRuleNode[];
            source_tenants?: string[];
        }
        export type GettableRuleVersions = GettableExtendedRuleNode[];
        /**
         * GettableSilence gettable silence
         */
        export interface GettableSilence {
            /**
             * comment
             */
            comment: string;
            /**
             * created by
             */
            createdBy: string;
            /**
             * ends at
             */
            endsAt: string; // date-time
            /**
             * id
             */
            id: string;
            matchers: /* Matchers matchers */ Matchers;
            /**
             * starts at
             */
            startsAt: string; // date-time
            status: /* SilenceStatus silence status */ SilenceStatus;
            /**
             * updated at
             */
            updatedAt: string; // date-time
        }
        /**
         * GettableSilences gettable silences
         */
        export type GettableSilences = /* GettableSilence gettable silence */ GettableSilence[];
        export interface GettableStatus {
            cluster: /* ClusterStatus cluster status */ ClusterStatus;
            config: /* nolint:revive */ PostableApiAlertingConfig;
            /**
             * uptime
             */
            uptime: string; // date-time
            versionInfo: /* VersionInfo version info */ VersionInfo;
        }
        export interface GettableTimeIntervals {
            name?: string;
            provenance?: Provenance;
            time_intervals?: TimeIntervalItem[];
            version?: string;
        }
        export interface GettableUserConfig {
            alertmanager_config?: GettableApiAlertingConfig;
            template_file_provenances?: {
                [name: string]: Provenance;
            };
            template_files?: {
                [name: string]: string;
            };
        }
        /**
         * GlobalConfig defines configuration parameters that are valid globally
         * unless overwritten.
         */
        export interface GlobalConfig {
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            opsgenie_api_key?: /* Secret special type for storing secrets. */ Secret;
            opsgenie_api_key_file?: string;
            opsgenie_api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            pagerduty_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            resolve_timeout?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            slack_api_url?: SecretURL;
            slack_api_url_file?: string;
            smtp_auth_identity?: string;
            smtp_auth_password?: /* Secret special type for storing secrets. */ Secret;
            smtp_auth_password_file?: string;
            smtp_auth_secret?: /* Secret special type for storing secrets. */ Secret;
            smtp_auth_username?: string;
            smtp_from?: string;
            smtp_hello?: string;
            smtp_require_tls?: boolean;
            smtp_smarthost?: /* HostPort represents a "host:port" network address. */ HostPort;
            telegram_api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            victorops_api_key?: /* Secret special type for storing secrets. */ Secret;
            victorops_api_key_file?: string;
            victorops_api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            webex_api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            wechat_api_corp_id?: string;
            wechat_api_secret?: /* Secret special type for storing secrets. */ Secret;
            wechat_api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
        }
        export interface Group {
            groupID?: string;
            mappings?: any;
        }
        export interface GroupAttributes {
            roles?: string[];
        }
        /**
         * HTTPClientConfig configures an HTTP client.
         */
        export interface HTTPClientConfig {
            authorization?: /* Authorization contains HTTP authorization credentials. */ Authorization;
            basic_auth?: /* BasicAuth contains basic HTTP authentication credentials. */ BasicAuth;
            bearer_token?: /* Secret special type for storing secrets. */ Secret;
            /**
             * The bearer token file for the targets. Deprecated in favour of
             * Authorization.CredentialsFile.
             */
            bearer_token_file?: string;
            /**
             * EnableHTTP2 specifies whether the client should configure HTTP2.
             * The omitempty flag is not set, because it would be hidden from the
             * marshalled configuration when set to false.
             */
            enable_http2?: boolean;
            /**
             * FollowRedirects specifies whether the client should follow HTTP 3xx redirects.
             * The omitempty flag is not set, because it would be hidden from the
             * marshalled configuration when set to false.
             */
            follow_redirects?: boolean;
            http_headers?: /* Headers represents the configuration for HTTP headers. */ Headers;
            /**
             * NoProxy contains addresses that should not use a proxy.
             */
            no_proxy?: string;
            oauth2?: /* OAuth2 is the oauth2 client configuration. */ OAuth2;
            proxy_connect_header?: ProxyHeader;
            /**
             * ProxyFromEnvironment makes use of net/http ProxyFromEnvironment function
             * to determine proxies.
             */
            proxy_from_environment?: boolean;
            proxy_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            tls_config?: /* TLSConfig configures the options for TLS connections. */ TLSConfig;
        }
        /**
         * Header represents the configuration for a single HTTP header.
         */
        export interface Header {
            files?: string[];
            secrets?: /* Secret special type for storing secrets. */ Secret[];
            values?: string[];
        }
        /**
         * Headers represents the configuration for HTTP headers.
         */
        export interface Headers {
            Headers?: {
                [name: string]: /* Header represents the configuration for a single HTTP header. */ Header;
            };
        }
        export interface HealthResponse {
            commit?: string;
            database?: string;
            enterpriseCommit?: string;
            version?: string;
        }
        export interface Hit {
            folderId?: number; // int64
            folderTitle?: string;
            folderUid?: string;
            folderUrl?: string;
            id?: number; // int64
            isDeleted?: boolean;
            isStarred?: boolean;
            orgId?: number; // int64
            permanentlyDeleteDate?: string; // date-time
            slug?: string;
            sortMeta?: number; // int64
            sortMetaName?: string;
            tags?: string[];
            title?: string;
            type?: HitType;
            uid?: string;
            uri?: string;
            url?: string;
        }
        export type HitList = Hit[];
        export type HitType = string;
        /**
         * HostPort represents a "host:port" network address.
         */
        export interface HostPort {
            Host?: string;
            Port?: string;
        }
        /**
         * An IPMask is a bitmask that can be used to manipulate
         * IP addresses for IP addressing and routing.
         * See type [IPNet] and func [ParseCIDR] for details.
         */
        export type IPMask = number /* uint8 */[];
        /**
         * An IPNet represents an IP network.
         */
        export interface IPNet {
            IP?: string;
            Mask?: /**
             * An IPMask is a bitmask that can be used to manipulate
             * IP addresses for IP addressing and routing.
             * See type [IPNet] and func [ParseCIDR] for details.
             */
            IPMask;
        }
        /**
         * ImportDashboardInput definition of input parameters when importing a dashboard.
         */
        export interface ImportDashboardInput {
            name?: string;
            pluginId?: string;
            type?: string;
            value?: string;
        }
        /**
         * ImportDashboardRequest request object for importing a dashboard.
         */
        export interface ImportDashboardRequest {
            dashboard?: Json;
            /**
             * Deprecated: use FolderUID instead
             */
            folderId?: number; // int64
            folderUid?: string;
            inputs?: /* ImportDashboardInput definition of input parameters when importing a dashboard. */ ImportDashboardInput[];
            overwrite?: boolean;
            path?: string;
            pluginId?: string;
        }
        /**
         * ImportDashboardResponse response object returned when importing a dashboard.
         */
        export interface ImportDashboardResponse {
            dashboardId?: number; // int64
            description?: string;
            /**
             * Deprecated: use FolderUID instead
             */
            folderId?: number; // int64
            folderUid?: string;
            imported?: boolean;
            importedRevision?: number; // int64
            importedUri?: string;
            importedUrl?: string;
            path?: string;
            pluginId?: string;
            removed?: boolean;
            revision?: number; // int64
            slug?: string;
            title?: string;
            uid?: string;
        }
        /**
         * InhibitRule defines an inhibition rule that mutes alerts that match the
         * target labels if an alert matching the source labels exists.
         * Both alerts have to have a set of labels being equal.
         */
        export interface InhibitRule {
            equal?: /* LabelNames is a sortable LabelName slice. In implements sort.Interface. */ LabelNames;
            /**
             * SourceMatch defines a set of labels that have to equal the given
             * value for source alerts. Deprecated. Remove before v1.0 release.
             */
            source_match?: {
                [name: string]: string;
            };
            source_match_re?: /* MatchRegexps represents a map of Regexp. */ MatchRegexps;
            source_matchers?: /**
             * Matchers is a slice of Matchers that is sortable, implements Stringer, and
             * provides a Matches method to match a LabelSet against all Matchers in the
             * slice. Note that some users of Matchers might require it to be sorted.
             */
            Matchers;
            /**
             * TargetMatch defines a set of labels that have to equal the given
             * value for target alerts. Deprecated. Remove before v1.0 release.
             */
            target_match?: {
                [name: string]: string;
            };
            target_match_re?: /* MatchRegexps represents a map of Regexp. */ MatchRegexps;
            target_matchers?: /**
             * Matchers is a slice of Matchers that is sortable, implements Stringer, and
             * provides a Matches method to match a LabelSet against all Matchers in the
             * slice. Note that some users of Matchers might require it to be sorted.
             */
            Matchers;
        }
        /**
         * InspectType is a type for the Inspect property of a Notice.
         */
        export type InspectType = number; // int64
        /**
         * InternalDataLink definition to allow Explore links to be constructed in the backend
         */
        export interface InternalDataLink {
            datasourceName?: string;
            datasourceUid?: string;
            panelsState?: /* This is an object constructed with the keys as the values of the enum VisType and the value being a bag of properties */ ExplorePanelsState;
            query?: any;
            timeRange?: /* Redefining this to avoid an import cycle */ TimeRange;
            transformations?: LinkTransformationConfig[];
        }
        /**
         * JSONWebKey represents a public or private key in JWK format. It can be
         * marshaled into JSON and unmarshaled from JSON.
         */
        export interface JSONWebKey {
            /**
             * Key algorithm, parsed from `alg` header.
             */
            Algorithm?: string;
            /**
             * X.509 certificate thumbprint (SHA-1), parsed from `x5t` header.
             */
            CertificateThumbprintSHA1?: number /* uint8 */[];
            /**
             * X.509 certificate thumbprint (SHA-256), parsed from `x5t#S256` header.
             */
            CertificateThumbprintSHA256?: number /* uint8 */[];
            /**
             * X.509 certificate chain, parsed from `x5c` header.
             */
            Certificates?: /* A Certificate represents an X.509 certificate. */ Certificate[];
            CertificatesURL?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            /**
             * Key is the Go in-memory representation of this key. It must have one
             * of these types:
             * ed25519.PublicKey
             * ed25519.PrivateKey
             * ecdsa.PublicKey
             * ecdsa.PrivateKey
             * rsa.PublicKey
             * rsa.PrivateKey
             * []byte (a symmetric key)
             *
             * When marshaling this JSONWebKey into JSON, the "kty" header parameter
             * will be automatically set based on the type of this field.
             */
            Key?: any;
            /**
             * Key identifier, parsed from `kid` header.
             */
            KeyID?: string;
            /**
             * Key use, parsed from `use` header.
             */
            Use?: string;
        }
        export interface Json {
        }
        /**
         * KeyUsage represents the set of actions that are valid for a given key. It's
         * a bitmap of the KeyUsage* constants.
         */
        export type KeyUsage = number; // int64
        /**
         * Label is a key/value pair of strings.
         */
        export interface Label {
            Name?: string;
        }
        /**
         * A LabelName is a key for a LabelSet or Metric.  It has a value associated
         * therewith.
         */
        export type LabelName = string;
        /**
         * LabelNames is a sortable LabelName slice. In implements sort.Interface.
         */
        export type LabelNames = /**
         * A LabelName is a key for a LabelSet or Metric.  It has a value associated
         * therewith.
         */
        LabelName[];
        /**
         * LabelSet label set
         */
        export interface LabelSet {
            [name: string]: string;
        }
        /**
         * A LabelValue is an associated value for a LabelName.
         */
        export type LabelValue = string;
        /**
         * Labels is a sorted set of labels. Order has to be guaranteed upon
         * instantiation.
         */
        export type Labels = /* Label is a key/value pair of strings. */ Label[];
        /**
         * LibraryElementArrayResponse is a response struct for an array of LibraryElementDTO.
         */
        export interface LibraryElementArrayResponse {
            result?: /* LibraryElementDTO is the frontend DTO for entities. */ LibraryElementDTO[];
        }
        /**
         * LibraryElementConnectionDTO is the frontend DTO for element connections.
         */
        export interface LibraryElementConnectionDTO {
            connectionId?: number; // int64
            connectionUid?: string;
            created?: string; // date-time
            createdBy?: LibraryElementDTOMetaUser;
            elementId?: number; // int64
            id?: number; // int64
            kind?: number; // int64
        }
        /**
         * LibraryElementConnectionsResponse is a response struct for an array of LibraryElementConnectionDTO.
         */
        export interface LibraryElementConnectionsResponse {
            result?: /* LibraryElementConnectionDTO is the frontend DTO for element connections. */ LibraryElementConnectionDTO[];
        }
        /**
         * LibraryElementDTO is the frontend DTO for entities.
         */
        export interface LibraryElementDTO {
            description?: string;
            /**
             * Deprecated: use FolderUID instead
             */
            folderId?: number; // int64
            folderUid?: string;
            id?: number; // int64
            kind?: number; // int64
            meta?: /* LibraryElementDTOMeta is the meta information for LibraryElementDTO. */ LibraryElementDTOMeta;
            model?: {
                [key: string]: any;
            };
            name?: string;
            orgId?: number; // int64
            schemaVersion?: number; // int64
            type?: string;
            uid?: string;
            version?: number; // int64
        }
        /**
         * LibraryElementDTOMeta is the meta information for LibraryElementDTO.
         */
        export interface LibraryElementDTOMeta {
            connectedDashboards?: number; // int64
            created?: string; // date-time
            createdBy?: LibraryElementDTOMetaUser;
            folderName?: string;
            folderUid?: string;
            updated?: string; // date-time
            updatedBy?: LibraryElementDTOMetaUser;
        }
        export interface LibraryElementDTOMetaUser {
            avatarUrl?: string;
            id?: number; // int64
            name?: string;
        }
        /**
         * LibraryElementResponse is a response struct for LibraryElementDTO.
         */
        export interface LibraryElementResponse {
            result?: /* LibraryElementDTO is the frontend DTO for entities. */ LibraryElementDTO;
        }
        /**
         * LibraryElementSearchResponse is a response struct for LibraryElementSearchResult.
         */
        export interface LibraryElementSearchResponse {
            result?: /* LibraryElementSearchResult is the search result for entities. */ LibraryElementSearchResult;
        }
        /**
         * LibraryElementSearchResult is the search result for entities.
         */
        export interface LibraryElementSearchResult {
            elements?: /* LibraryElementDTO is the frontend DTO for entities. */ LibraryElementDTO[];
            page?: number; // int64
            perPage?: number; // int64
            totalCount?: number; // int64
        }
        export interface LinkTransformationConfig {
            expression?: string;
            field?: string;
            mapValue?: string;
            type?: SupportedTransformationTypes;
        }
        export interface MSTeamsConfig {
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            send_resolved?: boolean;
            summary?: string;
            text?: string;
            title?: string;
            webhook_url?: SecretURL;
            webhook_url_file?: string;
        }
        /**
         * ManagerKind is the type of manager, which is responsible for managing the resource.
         * It can be a user or a tool or a generic API client.
         * +enum
         */
        export type ManagerKind = string;
        export interface MassDeleteAnnotationsCmd {
            annotationId?: number; // int64
            dashboardId?: number; // int64
            dashboardUID?: string;
            panelId?: number; // int64
        }
        /**
         * MatchRegexps represents a map of Regexp.
         */
        export interface MatchRegexps {
            [name: string]: string;
        }
        /**
         * MatchType is an enum for label matching types.
         */
        export type MatchType = number; // int64
        /**
         * Matcher matcher
         */
        export interface Matcher {
            /**
             * is equal
             */
            isEqual?: boolean;
            /**
             * is regex
             */
            isRegex: boolean;
            /**
             * name
             */
            name: string;
            /**
             * value
             */
            value: string;
        }
        /**
         * Matchers matchers
         */
        export type Matchers = /* Matcher matcher */ Matcher[];
        export interface MessageResponse {
            message?: string;
        }
        /**
         * Metadata contains user accesses for a given resource
         * Ex: map[string]bool{"create":true, "delete": true}
         */
        export interface Metadata {
            [name: string]: boolean;
        }
        export interface MetricRequest {
            debug?: boolean;
            /**
             * From Start time in epoch timestamps in milliseconds or relative using Grafana time units.
             * example:
             * now-1h
             */
            from: string;
            /**
             * queries.refId – Specifies an identifier of the query. Is optional and default to “A”.
             * queries.datasourceId – Specifies the data source to be queried. Each query in the request must have an unique datasourceId.
             * queries.maxDataPoints - Species maximum amount of data points that dashboard panel can render. Is optional and default to 100.
             * queries.intervalMs - Specifies the time interval in milliseconds of time series. Is optional and defaults to 1000.
             * example:
             * [
             *   {
             *     "datasource": {
             *       "uid": "PD8C576611E62080A"
             *     },
             *     "format": "table",
             *     "intervalMs": 86400000,
             *     "maxDataPoints": 1092,
             *     "rawSql": "SELECT 1 as valueOne, 2 as valueTwo",
             *     "refId": "A"
             *   }
             * ]
             */
            queries: Json[];
            /**
             * To End time in epoch timestamps in milliseconds or relative using Grafana time units.
             * example:
             * now
             */
            to: string;
        }
        export interface MigrateDataResponseDTO {
            items?: MigrateDataResponseItemDTO[];
            uid?: string;
        }
        export interface MigrateDataResponseItemDTO {
            errorCode?: "DATASOURCE_NAME_CONFLICT" | "DATASOURCE_INVALID_URL" | "DATASOURCE_ALREADY_MANAGED" | "FOLDER_NAME_CONFLICT" | "DASHBOARD_ALREADY_MANAGED" | "LIBRARY_ELEMENT_NAME_CONFLICT" | "UNSUPPORTED_DATA_TYPE" | "RESOURCE_CONFLICT" | "UNEXPECTED_STATUS_CODE" | "INTERNAL_SERVICE_ERROR" | "GENERIC_ERROR";
            message?: string;
            name?: string;
            parentName?: string;
            refId: string;
            status: "OK" | "WARNING" | "ERROR" | "PENDING" | "UNKNOWN";
            type: "DASHBOARD" | "DATASOURCE" | "FOLDER" | "LIBRARY_ELEMENT" | "ALERT_RULE" | "ALERT_RULE_GROUP" | "CONTACT_POINT" | "NOTIFICATION_POLICY" | "NOTIFICATION_TEMPLATE" | "MUTE_TIMING" | "PLUGIN";
        }
        export interface MigrateDataResponseListDTO {
            uid?: string;
        }
        /**
         * MoveFolderCommand captures the information required by the folder service
         * to move a folder.
         */
        export interface MoveFolderCommand {
            parentUid?: string;
        }
        export interface MultiStatus {
        }
        /**
         * MuteTimeInterval represents a named set of time intervals for which a route should be muted.
         */
        export interface MuteTimeInterval {
            name?: string;
            time_intervals?: /* TimeInterval represents a named set of time intervals for which a route should be muted. */ TimeInterval[];
        }
        export interface MuteTimeIntervalExport {
            name?: string;
            orgId?: number; // int64
            time_intervals?: /* TimeInterval represents a named set of time intervals for which a route should be muted. */ TimeInterval[];
        }
        export type MuteTimings = /* MuteTimeInterval represents a named set of time intervals for which a route should be muted. */ MuteTimeInterval[];
        /**
         * Name represents an X.509 distinguished name. This only includes the common
         * elements of a DN. Note that Name is only an approximation of the X.509
         * structure. If an accurate representation is needed, asn1.Unmarshal the raw
         * subject or issuer as an [RDNSequence].
         */
        export interface Name {
            Country?: string[];
            /**
             * ExtraNames contains attributes to be copied, raw, into any marshaled
             * distinguished names. Values override any attributes with the same OID.
             * The ExtraNames field is not populated when parsing, see Names.
             */
            ExtraNames?: /**
             * AttributeTypeAndValue mirrors the ASN.1 structure of the same name in
             * RFC 5280, Section 4.1.2.4.
             */
            AttributeTypeAndValue[];
            Locality?: string[];
            /**
             * Names contains all parsed attributes. When parsing distinguished names,
             * this can be used to extract non-standard attributes that are not parsed
             * by this package. When marshaling to RDNSequences, the Names field is
             * ignored, see ExtraNames.
             */
            Names?: /**
             * AttributeTypeAndValue mirrors the ASN.1 structure of the same name in
             * RFC 5280, Section 4.1.2.4.
             */
            AttributeTypeAndValue[];
            SerialNumber?: string;
            StreetAddress?: string[];
        }
        export interface NamespaceConfigResponse {
            [name: string]: GettableRuleGroupConfig[];
        }
        export interface NavbarPreference {
            bookmarkUrls?: string[];
        }
        export interface NewApiKeyResult {
            /**
             * example:
             * 1
             */
            id?: number; // int64
            /**
             * example:
             * glsa_yscW25imSKJIuav8zF37RZmnbiDvB05G_fcaaf58a
             */
            key?: string;
            /**
             * example:
             * grafana
             */
            name?: string;
        }
        export interface NotFound {
        }
        /**
         * Notice provides a structure for presenting notifications in Grafana's user interface.
         */
        export interface Notice {
            inspect?: /* InspectType is a type for the Inspect property of a Notice. */ InspectType /* int64 */;
            /**
             * Link is an optional link for display in the user interface and can be an
             * absolute URL or a path relative to Grafana's root url.
             */
            link?: string;
            severity?: /* NoticeSeverity is a type for the Severity property of a Notice. */ NoticeSeverity /* int64 */;
            /**
             * Text is freeform descriptive text for the notice.
             */
            text?: string;
        }
        /**
         * NoticeSeverity is a type for the Severity property of a Notice.
         */
        export type NoticeSeverity = number; // int64
        /**
         * NotificationPolicyExport is the provisioned file export of alerting.NotificiationPolicyV1.
         */
        export interface NotificationPolicyExport {
            continue?: boolean;
            group_by?: string[];
            group_interval?: string;
            group_wait?: string;
            /**
             * Deprecated. Remove before v1.0 release.
             */
            match?: {
                [name: string]: string;
            };
            match_re?: /* MatchRegexps represents a map of Regexp. */ MatchRegexps;
            matchers?: /**
             * Matchers is a slice of Matchers that is sortable, implements Stringer, and
             * provides a Matches method to match a LabelSet against all Matchers in the
             * slice. Note that some users of Matchers might require it to be sorted.
             */
            Matchers;
            mute_time_intervals?: string[];
            object_matchers?: /* ObjectMatchers is a list of matchers that can be used to filter alerts. */ ObjectMatchers;
            orgId?: number; // int64
            receiver?: string;
            repeat_interval?: string;
            routes?: /**
             * RouteExport is the provisioned file export of definitions.Route. This is needed to hide fields that aren't useable in
             * provisioning file format. An alternative would be to define a custom MarshalJSON and MarshalYAML that excludes them.
             */
            RouteExport[];
        }
        export interface NotificationTemplate {
            name?: string;
            provenance?: Provenance;
            template?: string;
            version?: string;
        }
        export interface NotificationTemplateContent {
            template?: string;
            version?: string;
        }
        export type NotificationTemplates = NotificationTemplate[];
        /**
         * NotifierConfig contains base options common across all notifier configurations.
         */
        export interface NotifierConfig {
            send_resolved?: boolean;
        }
        /**
         * OAuth2 is the oauth2 client configuration.
         */
        export interface OAuth2 {
            TLSConfig?: /* TLSConfig configures the options for TLS connections. */ TLSConfig;
            client_id?: string;
            client_secret?: /* Secret special type for storing secrets. */ Secret;
            client_secret_file?: string;
            /**
             * ClientSecretRef is the name of the secret within the secret manager to use as the client
             * secret.
             */
            client_secret_ref?: string;
            endpoint_params?: {
                [name: string]: string;
            };
            /**
             * NoProxy contains addresses that should not use a proxy.
             */
            no_proxy?: string;
            proxy_connect_header?: ProxyHeader;
            /**
             * ProxyFromEnvironment makes use of net/http ProxyFromEnvironment function
             * to determine proxies.
             */
            proxy_from_environment?: boolean;
            proxy_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            scopes?: string[];
            token_url?: string;
        }
        /**
         * An ObjectIdentifier represents an ASN.1 OBJECT IDENTIFIER.
         */
        export type ObjectIdentifier = number /* int64 */[];
        /**
         * ObjectMatcher is a matcher that can be used to filter alerts.
         */
        export type ObjectMatcher = string[];
        /**
         * ObjectMatchers is a list of matchers that can be used to filter alerts.
         */
        export type ObjectMatchers = /* ObjectMatcher is a matcher that can be used to filter alerts. */ ObjectMatcher[];
        /**
         * OpsGenieConfig configures notifications via OpsGenie.
         */
        export interface OpsGenieConfig {
            actions?: string;
            api_key?: /* Secret special type for storing secrets. */ Secret;
            api_key_file?: string;
            api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            description?: string;
            details?: {
                [name: string]: string;
            };
            entity?: string;
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            message?: string;
            note?: string;
            priority?: string;
            responders?: OpsGenieConfigResponder[];
            send_resolved?: boolean;
            source?: string;
            tags?: string;
            update_alerts?: boolean;
        }
        export interface OpsGenieConfigResponder {
            /**
             * One of those 3 should be filled.
             */
            id?: string;
            name?: string;
            /**
             * team, user, escalation, schedule etc.
             */
            type?: string;
            username?: string;
        }
        export interface OrgDTO {
            id?: number; // int64
            name?: string;
        }
        export interface OrgDetailsDTO {
            address?: Address;
            id?: number; // int64
            name?: string;
        }
        export interface OrgUserDTO {
            accessControl?: {
                [name: string]: boolean;
            };
            authLabels?: string[];
            avatarUrl?: string;
            email?: string;
            isDisabled?: boolean;
            isExternallySynced?: boolean;
            lastSeenAt?: string; // date-time
            lastSeenAtAge?: string;
            login?: string;
            name?: string;
            orgId?: number; // int64
            role?: string;
            uid?: string;
            userId?: number; // int64
        }
        /**
         * PagerdutyConfig configures notifications via PagerDuty.
         */
        export interface PagerdutyConfig {
            class?: string;
            client?: string;
            client_url?: string;
            component?: string;
            description?: string;
            details?: {
                [name: string]: string;
            };
            group?: string;
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            images?: /* PagerdutyImage is an image. */ PagerdutyImage[];
            links?: /* PagerdutyLink is a link. */ PagerdutyLink[];
            routing_key?: /* Secret special type for storing secrets. */ Secret;
            routing_key_file?: string;
            send_resolved?: boolean;
            service_key?: /* Secret special type for storing secrets. */ Secret;
            service_key_file?: string;
            severity?: string;
            source?: string;
            url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
        }
        /**
         * PagerdutyImage is an image.
         */
        export interface PagerdutyImage {
            alt?: string;
            href?: string;
            src?: string;
        }
        /**
         * PagerdutyLink is a link.
         */
        export interface PagerdutyLink {
            href?: string;
            text?: string;
        }
        export type Password = string;
        export interface PatchAnnotationsCmd {
            data?: Json;
            id?: number; // int64
            tags?: string[];
            text?: string;
            time?: number; // int64
            timeEnd?: number; // int64
        }
        /**
         * PatchLibraryElementCommand is the command for patching a LibraryElement
         */
        export interface PatchLibraryElementCommand {
            /**
             * ID of the folder where the library element is stored.
             *
             * Deprecated: use FolderUID instead
             */
            folderId?: number; // int64
            /**
             * UID of the folder where the library element is stored.
             */
            folderUid?: string;
            /**
             * Kind of element to create, Use 1 for library panels or 2 for c.
             * Description:
             * 1 - library panels
             * 2 - library variables
             */
            kind?: 1 | 2; // int64
            /**
             * The JSON model for the library element.
             */
            model?: {
                [key: string]: any;
            };
            /**
             * Name of the library element.
             */
            name?: string;
            uid?: string;
            /**
             * Version of the library element you are updating.
             */
            version?: number; // int64
        }
        export interface PatchPrefsCmd {
            cookies?: CookieType[];
            /**
             * The numerical :id of a favorited dashboard
             */
            homeDashboardId?: number; // int64
            homeDashboardUID?: string;
            language?: string;
            navbar?: NavbarPreference;
            queryHistory?: QueryHistoryPreference;
            theme?: "light" | "dark";
            timezone?: "utc" | "browser";
            weekStart?: string;
        }
        /**
         * PatchQueryCommentInQueryHistoryCommand is the command for updating comment for query in query history
         */
        export interface PatchQueryCommentInQueryHistoryCommand {
            /**
             * Updated comment
             */
            comment?: string;
        }
        /**
         * PeerStatus peer status
         */
        export interface PeerStatus {
            /**
             * address
             */
            address: string;
            /**
             * name
             */
            name: string;
        }
        /**
         * Permission is the model for access control permissions.
         */
        export interface Permission {
            action?: string;
            created?: string; // date-time
            scope?: string;
            updated?: string; // date-time
        }
        export interface PermissionDenied {
        }
        export type PermissionType = number; // int64
        /**
         * Playlist model
         */
        export interface Playlist {
            id?: number; // int64
            interval?: string;
            name?: string;
            uid?: string;
        }
        export interface PlaylistDTO {
            /**
             * Interval sets the time between switching views in a playlist.
             */
            interval?: string;
            /**
             * The ordered list of items that the playlist will iterate over.
             */
            items?: PlaylistItemDTO[];
            /**
             * Name of the playlist.
             */
            name?: string;
            /**
             * Unique playlist identifier. Generated on creation, either by the
             * creator of the playlist of by the application.
             */
            uid?: string;
        }
        export interface PlaylistDashboard {
            id?: number; // int64
            order?: number; // int64
            slug?: string;
            title?: string;
            uri?: string;
            url?: string;
        }
        export type PlaylistDashboardsSlice = PlaylistDashboard[];
        export interface PlaylistItem {
            Id?: number; // int64
            PlaylistId?: number; // int64
            order?: number; // int64
            title?: string;
            type?: string;
            value?: string;
        }
        export interface PlaylistItemDTO {
            /**
             * Title is an unused property -- it will be removed in the future
             */
            title?: string;
            /**
             * Type of the item.
             */
            type?: string;
            /**
             * Value depends on type and describes the playlist item.
             *
             * dashboard_by_id: The value is an internal numerical identifier set by Grafana. This
             * is not portable as the numerical identifier is non-deterministic between different instances.
             * Will be replaced by dashboard_by_uid in the future. (deprecated)
             * dashboard_by_tag: The value is a tag which is set on any number of dashboards. All
             * dashboards behind the tag will be added to the playlist.
             * dashboard_by_uid: The value is the dashboard UID
             */
            value?: string;
        }
        export type Playlists = /* Playlist model */ Playlist[];
        /**
         * PolicyMapping represents a policy mapping entry in the policyMappings extension.
         */
        export interface PolicyMapping {
            /**
             * IssuerDomainPolicy contains a policy OID the issuing certificate considers
             * equivalent to SubjectDomainPolicy in the subject certificate.
             */
            IssuerDomainPolicy?: string;
            /**
             * SubjectDomainPolicy contains a OID the issuing certificate considers
             * equivalent to IssuerDomainPolicy in the subject certificate.
             */
            SubjectDomainPolicy?: string;
        }
        export interface PostAnnotationsCmd {
            dashboardId?: number; // int64
            dashboardUID?: string;
            data?: Json;
            panelId?: number; // int64
            tags?: string[];
            text: string;
            time?: number; // int64
            timeEnd?: number; // int64
        }
        export interface PostGraphiteAnnotationsCmd {
            data?: string;
            tags?: any;
            what?: string;
            when?: number; // int64
        }
        export interface PostSilencesOKBody {
            /**
             * silence ID
             */
            silenceID?: string;
        }
        /**
         * PostableAlert postable alert
         */
        export interface PostableAlert {
            annotations?: /* LabelSet label set */ LabelSet;
            /**
             * ends at
             * Format: date-time
             */
            endsAt?: string; // date-time
            /**
             * generator URL
             * Format: uri
             */
            generatorURL?: string; // uri
            labels: /* LabelSet label set */ LabelSet;
            /**
             * starts at
             * Format: date-time
             */
            startsAt?: string; // date-time
        }
        /**
         * PostableAlerts postable alerts
         */
        export type PostableAlerts = /* PostableAlert postable alert */ PostableAlert[];
        /**
         * nolint:revive
         */
        export interface PostableApiAlertingConfig {
            global?: /**
             * GlobalConfig defines configuration parameters that are valid globally
             * unless overwritten.
             */
            GlobalConfig;
            inhibit_rules?: /**
             * InhibitRule defines an inhibition rule that mutes alerts that match the
             * target labels if an alert matching the source labels exists.
             * Both alerts have to have a set of labels being equal.
             */
            InhibitRule[];
            /**
             * MuteTimeIntervals is deprecated and will be removed before Alertmanager 1.0.
             */
            mute_time_intervals?: /* MuteTimeInterval represents a named set of time intervals for which a route should be muted. */ MuteTimeInterval[];
            /**
             * Override with our superset receiver type
             */
            receivers?: /* nolint:revive */ PostableApiReceiver[];
            route?: /**
             * A Route is a node that contains definitions of how to handle alerts. This is modified
             * from the upstream alertmanager in that it adds the ObjectMatchers property.
             */
            Route;
            templates?: string[];
            time_intervals?: /* TimeInterval represents a named set of time intervals for which a route should be muted. */ TimeInterval[];
        }
        /**
         * nolint:revive
         */
        export interface PostableApiReceiver {
            discord_configs?: /* DiscordConfig configures notifications via Discord. */ DiscordConfig[];
            email_configs?: /* EmailConfig configures notifications via mail. */ EmailConfig[];
            grafana_managed_receiver_configs?: PostableGrafanaReceiver[];
            msteams_configs?: MSTeamsConfig[];
            /**
             * A unique identifier for this receiver.
             */
            name?: string;
            opsgenie_configs?: /* OpsGenieConfig configures notifications via OpsGenie. */ OpsGenieConfig[];
            pagerduty_configs?: /* PagerdutyConfig configures notifications via PagerDuty. */ PagerdutyConfig[];
            pushover_configs?: PushoverConfig[];
            slack_configs?: /* SlackConfig configures notifications via Slack. */ SlackConfig[];
            sns_configs?: SNSConfig[];
            telegram_configs?: /* TelegramConfig configures notifications via Telegram. */ TelegramConfig[];
            victorops_configs?: /* VictorOpsConfig configures notifications via VictorOps. */ VictorOpsConfig[];
            webex_configs?: /* WebexConfig configures notifications via Webex. */ WebexConfig[];
            webhook_configs?: /* WebhookConfig configures notifications via a generic webhook. */ WebhookConfig[];
            wechat_configs?: /* WechatConfig configures notifications via Wechat. */ WechatConfig[];
        }
        export interface PostableExtendedRuleNode {
            alert?: string;
            annotations?: {
                [name: string]: string;
            };
            expr?: string;
            for?: string;
            grafana_alert?: PostableGrafanaRule;
            keep_firing_for?: string;
            labels?: {
                [name: string]: string;
            };
            record?: string;
        }
        export interface PostableExtendedRuleNodeExtended {
            /**
             * example:
             * project_x
             */
            folderTitle?: string;
            /**
             * example:
             * okrd3I0Vz
             */
            folderUid?: string;
            rule: PostableExtendedRuleNode;
            /**
             * example:
             * eval_group_1
             */
            ruleGroup?: string;
        }
        export interface PostableGrafanaReceiver {
            disableResolveMessage?: boolean;
            name?: string;
            secureSettings?: {
                [name: string]: string;
            };
            settings?: RawMessage;
            type?: string;
            uid?: string;
        }
        export interface PostableGrafanaReceivers {
            grafana_managed_receiver_configs?: PostableGrafanaReceiver[];
        }
        export interface PostableGrafanaRule {
            condition?: string;
            data?: /* AlertQuery represents a single query associated with an alert definition. */ AlertQuery[];
            exec_err_state?: "OK" | "Alerting" | "Error";
            is_paused?: boolean;
            metadata?: AlertRuleMetadata;
            no_data_state?: "Alerting" | "NoData" | "OK";
            notification_settings?: AlertRuleNotificationSettings;
            record?: Record;
            title?: string;
            uid?: string;
        }
        export interface PostableNGalertConfig {
            alertmanagersChoice?: "all" | "internal" | "external";
        }
        export interface PostableRuleGroupConfig {
            align_evaluation_time_on_interval?: boolean;
            evaluation_delay?: string;
            interval?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            limit?: number; // int64
            name?: string;
            query_offset?: string;
            rules?: PostableExtendedRuleNode[];
            source_tenants?: string[];
        }
        /**
         * PostableSilence postable silence
         */
        export interface PostableSilence {
            /**
             * comment
             */
            comment: string;
            /**
             * created by
             */
            createdBy: string;
            /**
             * ends at
             */
            endsAt: string; // date-time
            /**
             * id
             */
            id?: string;
            matchers: /* Matchers matchers */ Matchers;
            /**
             * starts at
             */
            startsAt: string; // date-time
        }
        export interface PostableTimeIntervals {
            name?: string;
            time_intervals?: TimeIntervalItem[];
            version?: string;
        }
        export interface PostableUserConfig {
            alertmanager_config?: /* nolint:revive */ PostableApiAlertingConfig;
            template_files?: {
                [name: string]: string;
            };
        }
        /**
         * Spec defines user, team or org Grafana preferences
         */
        export interface Preferences {
            cookiePreferences?: CookiePreferences;
            /**
             * UID for the home dashboard
             */
            homeDashboardUID?: string;
            /**
             * Selected language (beta)
             */
            language?: string;
            navbar?: NavbarPreference;
            queryHistory?: QueryHistoryPreference;
            /**
             * light, dark, empty is default
             */
            theme?: string;
            /**
             * The timezone selection
             * TODO: this should use the timezone defined in common
             */
            timezone?: string;
            /**
             * day of the week (sunday, monday, etc)
             */
            weekStart?: string;
        }
        export interface PrometheusNamespace {
            /**
             * in: body
             */
            Body?: {
                [name: string]: PrometheusRuleGroup[];
            };
        }
        export interface PrometheusRemoteWriteTargetJSON {
            data_source_uid?: string;
            id?: string;
            remote_write_path?: string;
        }
        export interface PrometheusRule {
            Alert?: string;
            Annotations?: {
                [name: string]: string;
            };
            Expr?: string;
            For?: string;
            KeepFiringFor?: string;
            Labels?: {
                [name: string]: string;
            };
            Record?: string;
        }
        export interface PrometheusRuleGroup {
            Interval?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            Name?: string;
            Rules?: PrometheusRule[];
        }
        export type Provenance = string;
        export interface ProvisionedAlertRule {
            /**
             * example:
             * {
             *   "runbook_url": "https://supercoolrunbook.com/page/13"
             * }
             */
            annotations?: {
                [name: string]: string;
            };
            /**
             * example:
             * A
             */
            condition: string;
            /**
             * example:
             * [
             *   {
             *     "datasourceUid": "__expr__",
             *     "model": {
             *       "conditions": [
             *         {
             *           "evaluator": {
             *             "params": [
             *               0,
             *               0
             *             ],
             *             "type": "gt"
             *           },
             *           "operator": {
             *             "type": "and"
             *           },
             *           "query": {
             *             "params": []
             *           },
             *           "reducer": {
             *             "params": [],
             *             "type": "avg"
             *           },
             *           "type": "query"
             *         }
             *       ],
             *       "datasource": {
             *         "type": "__expr__",
             *         "uid": "__expr__"
             *       },
             *       "expression": "1 == 1",
             *       "hide": false,
             *       "intervalMs": 1000,
             *       "maxDataPoints": 43200,
             *       "refId": "A",
             *       "type": "math"
             *     },
             *     "queryType": "",
             *     "refId": "A",
             *     "relativeTimeRange": {
             *       "from": 0,
             *       "to": 0
             *     }
             *   }
             * ]
             */
            data: /* AlertQuery represents a single query associated with an alert definition. */ AlertQuery[];
            execErrState: "OK" | "Alerting" | "Error";
            /**
             * example:
             * project_x
             */
            folderUID: string;
            for: string; // duration
            id?: number; // int64
            /**
             * example:
             * false
             */
            isPaused?: boolean;
            /**
             * example:
             * {
             *   "team": "sre-team-1"
             * }
             */
            labels?: {
                [name: string]: string;
            };
            noDataState: "Alerting" | "NoData" | "OK";
            notification_settings?: AlertRuleNotificationSettings;
            orgID: number; // int64
            provenance?: Provenance;
            record?: Record;
            /**
             * example:
             * eval_group_1
             */
            ruleGroup: string;
            /**
             * example:
             * Always firing
             */
            title: string;
            uid?: string; // ^[a-zA-Z0-9-_]+$
            updated?: string; // date-time
        }
        export type ProvisionedAlertRules = ProvisionedAlertRule[];
        export interface ProxyConfig {
            /**
             * NoProxy contains addresses that should not use a proxy.
             */
            no_proxy?: string;
            proxy_connect_header?: ProxyHeader;
            /**
             * ProxyFromEnvironment makes use of net/http ProxyFromEnvironment function
             * to determine proxies.
             */
            proxy_from_environment?: boolean;
            proxy_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
        }
        export interface ProxyHeader {
            [name: string]: /* Secret special type for storing secrets. */ Secret[];
        }
        export interface PublicDashboard {
            accessToken?: string;
            annotationsEnabled?: boolean;
            createdAt?: string; // date-time
            createdBy?: number; // int64
            dashboardUid?: string;
            isEnabled?: boolean;
            recipients?: EmailDTO[];
            share?: ShareType;
            timeSelectionEnabled?: boolean;
            uid?: string;
            updatedAt?: string; // date-time
            updatedBy?: number; // int64
        }
        export interface PublicDashboardDTO {
            accessToken?: string;
            annotationsEnabled?: boolean;
            isEnabled?: boolean;
            share?: ShareType;
            timeSelectionEnabled?: boolean;
            uid?: string;
        }
        export interface PublicDashboardListResponse {
            accessToken?: string;
            dashboardUid?: string;
            isEnabled?: boolean;
            slug?: string;
            title?: string;
            uid?: string;
        }
        export interface PublicDashboardListResponseWithPagination {
            page?: number; // int64
            perPage?: number; // int64
            publicDashboards?: PublicDashboardListResponse[];
            totalCount?: number; // int64
        }
        /**
         * PublicError is derived from Error and only contains information
         * available to the end user.
         */
        export interface PublicError {
            /**
             * Extra Additional information about the error
             */
            extra?: {
                [name: string]: any;
            };
            /**
             * Message A human readable message
             */
            message?: string;
            /**
             * MessageID A unique identifier for the error
             */
            messageId: string;
            /**
             * StatusCode The HTTP status code returned
             */
            statusCode: number; // int64
        }
        export type PublicKeyAlgorithm = number; // int64
        export interface PushoverConfig {
            device?: string;
            expire?: string;
            html?: boolean;
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            message?: string;
            priority?: string;
            retry?: string;
            send_resolved?: boolean;
            sound?: string;
            title?: string;
            token?: /* Secret special type for storing secrets. */ Secret;
            token_file?: string;
            ttl?: string;
            url?: string;
            url_title?: string;
            user_key?: /* Secret special type for storing secrets. */ Secret;
            user_key_file?: string;
        }
        /**
         * QueryDataResponse contains the results from a QueryDataRequest.
         * It is the return type of a QueryData call.
         */
        export interface QueryDataResponse {
            results?: /**
             * Responses is a map of RefIDs (Unique Query ID) to DataResponses.
             * The QueryData method the QueryDataHandler method will set the RefId
             * property on the DataResponses' frames based on these RefIDs.
             */
            Responses;
        }
        export interface QueryHistoryDTO {
            comment?: string;
            createdAt?: number; // int64
            createdBy?: number; // int64
            datasourceUid?: string;
            queries?: Json;
            starred?: boolean;
            uid?: string;
        }
        /**
         * QueryHistoryDeleteQueryResponse is the response struct for deleting a query from query history
         */
        export interface QueryHistoryDeleteQueryResponse {
            id?: number; // int64
            message?: string;
        }
        export interface QueryHistoryPreference {
            /**
             * one of: '' | 'query' | 'starred';
             */
            homeTab?: string;
        }
        /**
         * QueryHistoryResponse is a response struct for QueryHistoryDTO
         */
        export interface QueryHistoryResponse {
            result?: QueryHistoryDTO;
        }
        export interface QueryHistorySearchResponse {
            result?: QueryHistorySearchResult;
        }
        export interface QueryHistorySearchResult {
            page?: number; // int64
            perPage?: number; // int64
            queryHistory?: QueryHistoryDTO[];
            totalCount?: number; // int64
        }
        /**
         * QueryStat is used for storing arbitrary statistics metadata related to a query and its result, e.g. total request time, data processing time.
         * The embedded FieldConfig's display name must be set.
         * It corresponds to the QueryResultMetaStat on the frontend (https://github.com/grafana/grafana/blob/master/packages/grafana-data/src/types/data.ts#L53).
         */
        export interface QueryStat {
            /**
             * Map values to a display color
             * NOTE: this interface is under development in the frontend... so simple map for now
             */
            color?: {
                [name: string]: any;
            };
            /**
             * Panel Specific Values
             */
            custom?: {
                [name: string]: any;
            };
            decimals?: number; // uint16
            /**
             * Description is human readable field metadata
             */
            description?: string;
            /**
             * DisplayName overrides Grafana default naming, should not be used from a data source
             */
            displayName?: string;
            /**
             * DisplayNameFromDS overrides Grafana default naming strategy.
             */
            displayNameFromDS?: string;
            /**
             * Filterable indicates if the Field's data can be filtered by additional calls.
             */
            filterable?: boolean;
            /**
             * Interval indicates the expected regular step between values in the series.
             * When an interval exists, consumers can identify "missing" values when the expected value is not present.
             * The grafana timeseries visualization will render disconnected values when missing values are found it the time field.
             * The interval uses the same units as the values.  For time.Time, this is defined in milliseconds.
             */
            interval?: number; // double
            /**
             * The behavior when clicking on a result
             */
            links?: /* DataLink define what */ DataLink[];
            mappings?: ValueMappings;
            max?: /**
             * ConfFloat64 is a float64. It Marshals float64 values of NaN of Inf
             * to null.
             */
            ConfFloat64 /* double */;
            min?: /**
             * ConfFloat64 is a float64. It Marshals float64 values of NaN of Inf
             * to null.
             */
            ConfFloat64 /* double */;
            /**
             * Alternative to empty string
             */
            noValue?: string;
            /**
             * Path is an explicit path to the field in the datasource. When the frame meta includes a path,
             * this will default to `${frame.meta.path}/${field.name}
             *
             * When defined, this value can be used as an identifier within the datasource scope, and
             * may be used as an identifier to update values in a subsequent request
             */
            path?: string;
            thresholds?: /* ThresholdsConfig setup thresholds */ ThresholdsConfig;
            type?: /* FieldTypeConfig has type specific configs, only one should be active at a time */ FieldTypeConfig;
            /**
             * Numeric Options
             */
            unit?: string;
            value?: number; // double
            /**
             * Writeable indicates that the datasource knows how to update this value
             */
            writeable?: boolean;
        }
        export interface QuotaDTO {
            limit?: number; // int64
            org_id?: number; // int64
            target?: string;
            used?: number; // int64
            user_id?: number; // int64
        }
        export interface RawMessage {
        }
        /**
         * Receiver receiver
         */
        export interface Receiver {
            /**
             * name
             */
            name: string;
        }
        /**
         * ReceiverExport is the provisioned file export of alerting.ReceiverV1.
         */
        export interface ReceiverExport {
            disableResolveMessage?: boolean;
            settings?: RawMessage;
            type?: string;
            uid?: string;
        }
        export interface Record {
            /**
             * Which expression node should be used as the input for the recorded metric.
             * example:
             * A
             */
            from: string;
            /**
             * Name of the recorded metric.
             * example:
             * grafana_alerts_ratio
             */
            metric: string;
            /**
             * Which data source should be used to write the output of the recording rule, specified by UID.
             * example:
             * my-prom
             */
            target_datasource_uid?: string;
        }
        /**
         * RecordingRuleJSON is the external representation of a recording rule
         */
        export interface RecordingRuleJSON {
            active?: boolean;
            count?: boolean;
            description?: string;
            dest_data_source_uid?: string;
            id?: string;
            interval?: number; // int64
            name?: string;
            prom_name?: string;
            queries?: {
                [name: string]: any;
            }[];
            range?: number; // int64
            target_ref_id?: string;
        }
        /**
         * RelativeTimeRange is the per query start and end time
         * for requests.
         */
        export interface RelativeTimeRange {
            from?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            to?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
        }
        export interface RelativeTimeRangeExport {
            from?: number; // int64
            to?: number; // int64
        }
        export interface Report {
            created?: string; // date-time
            dashboards?: ReportDashboard[];
            enableCsv?: boolean;
            enableDashboardUrl?: boolean;
            formats?: /* +enum */ Type[];
            id?: number; // int64
            message?: string;
            name?: string;
            options?: ReportOptions;
            orgId?: number; // int64
            recipients?: string;
            replyTo?: string;
            scaleFactor?: number; // int64
            schedule?: ReportSchedule;
            state?: /* +enum */ State;
            subject?: string;
            uid?: string;
            updated?: string; // date-time
            userId?: number; // int64
        }
        export interface ReportBrandingOptions {
            emailFooterLink?: string;
            emailFooterMode?: string;
            emailFooterText?: string;
            emailLogoUrl?: string;
            reportLogoUrl?: string;
        }
        export interface ReportDashboard {
            dashboard?: ReportDashboardID;
            reportVariables?: {
                [key: string]: any;
            };
            timeRange?: ReportTimeRange;
        }
        export interface ReportDashboardID {
            id?: number; // int64
            name?: string;
            uid?: string;
        }
        export interface ReportEmail {
            /**
             * Comma-separated list of emails to which to send the report to.
             */
            emails?: string;
            /**
             * Send the report to the emails specified in the report. Required if emails is not present.
             */
            id?: string; // int64
            /**
             * Send the report to the emails specified in the report. Required if emails is not present.
             */
            useEmailsFromReport?: boolean;
        }
        export interface ReportOptions {
            layout?: string;
            orientation?: string;
            pdfCombineOneFile?: boolean;
            pdfShowTemplateVariables?: boolean;
            timeRange?: ReportTimeRange;
        }
        export interface ReportSchedule {
            dayOfMonth?: string;
            endDate?: string; // date-time
            frequency?: string;
            intervalAmount?: number; // int64
            intervalFrequency?: string;
            startDate?: string; // date-time
            timeZone?: string;
            workdaysOnly?: boolean;
        }
        export interface ReportSettings {
            branding?: ReportBrandingOptions;
            embeddedImageTheme?: string;
            id?: number; // int64
            orgId?: number; // int64
            pdfTheme?: string;
            userId?: number; // int64
        }
        export interface ReportTimeRange {
            from?: string;
            to?: string;
        }
        export interface ResourcePermissionDTO {
            actions?: string[];
            builtInRole?: string;
            id?: number; // int64
            isInherited?: boolean;
            isManaged?: boolean;
            isServiceAccount?: boolean;
            permission?: string;
            roleName?: string;
            team?: string;
            teamAvatarUrl?: string;
            teamId?: number; // int64
            teamUid?: string;
            userAvatarUrl?: string;
            userId?: number; // int64
            userLogin?: string;
            userUid?: string;
        }
        export interface ResponseDetails {
            msg?: string;
        }
        /**
         * Responses is a map of RefIDs (Unique Query ID) to DataResponses.
         * The QueryData method the QueryDataHandler method will set the RefId
         * property on the DataResponses' frames based on these RefIDs.
         */
        export interface Responses {
            [name: string]: /**
             * DataResponse contains the results from a DataQuery.
             * A map of RefIDs (unique query identifiers) to this type makes up the Responses property of a QueryDataResponse.
             * The Error property is used to allow for partial success responses from the containing QueryDataResponse.
             */
            DataResponse;
        }
        export interface RestoreDashboardVersionCommand {
            version?: number; // int64
        }
        export interface RestoreDeletedDashboardCommand {
            folderUid?: string;
        }
        export interface RevokeAuthTokenCmd {
            authTokenId?: number; // int64
        }
        export interface RoleAssignmentsDTO {
            role_uid?: string;
            service_accounts?: number /* int64 */[];
            teams?: number /* int64 */[];
            users?: number /* int64 */[];
        }
        export interface RoleDTO {
            created?: string; // date-time
            delegatable?: boolean;
            description?: string;
            displayName?: string;
            global?: boolean;
            group?: string;
            hidden?: boolean;
            mapped?: boolean;
            name?: string;
            permissions?: /* Permission is the model for access control permissions. */ Permission[];
            uid?: string;
            updated?: string; // date-time
            version?: number; // int64
        }
        export interface RolesSearchQuery {
            includeHidden?: boolean;
            orgId?: number; // int64
            teamIds?: number /* int64 */[];
            userIds?: number /* int64 */[];
        }
        /**
         * A Route is a node that contains definitions of how to handle alerts. This is modified
         * from the upstream alertmanager in that it adds the ObjectMatchers property.
         */
        export interface Route {
            active_time_intervals?: string[];
            continue?: boolean;
            group_by?: string[];
            group_interval?: string;
            group_wait?: string;
            /**
             * Deprecated. Remove before v1.0 release.
             */
            match?: {
                [name: string]: string;
            };
            match_re?: /* MatchRegexps represents a map of Regexp. */ MatchRegexps;
            matchers?: /**
             * Matchers is a slice of Matchers that is sortable, implements Stringer, and
             * provides a Matches method to match a LabelSet against all Matchers in the
             * slice. Note that some users of Matchers might require it to be sorted.
             */
            Matchers;
            mute_time_intervals?: string[];
            object_matchers?: /* ObjectMatchers is a list of matchers that can be used to filter alerts. */ ObjectMatchers;
            provenance?: Provenance;
            receiver?: string;
            repeat_interval?: string;
            routes?: /**
             * A Route is a node that contains definitions of how to handle alerts. This is modified
             * from the upstream alertmanager in that it adds the ObjectMatchers property.
             */
            Route[];
        }
        /**
         * RouteExport is the provisioned file export of definitions.Route. This is needed to hide fields that aren't useable in
         * provisioning file format. An alternative would be to define a custom MarshalJSON and MarshalYAML that excludes them.
         */
        export interface RouteExport {
            continue?: boolean;
            group_by?: string[];
            group_interval?: string;
            group_wait?: string;
            /**
             * Deprecated. Remove before v1.0 release.
             */
            match?: {
                [name: string]: string;
            };
            match_re?: /* MatchRegexps represents a map of Regexp. */ MatchRegexps;
            matchers?: /**
             * Matchers is a slice of Matchers that is sortable, implements Stringer, and
             * provides a Matches method to match a LabelSet against all Matchers in the
             * slice. Note that some users of Matchers might require it to be sorted.
             */
            Matchers;
            mute_time_intervals?: string[];
            object_matchers?: /* ObjectMatchers is a list of matchers that can be used to filter alerts. */ ObjectMatchers;
            receiver?: string;
            repeat_interval?: string;
            routes?: /**
             * RouteExport is the provisioned file export of definitions.Route. This is needed to hide fields that aren't useable in
             * provisioning file format. An alternative would be to define a custom MarshalJSON and MarshalYAML that excludes them.
             */
            RouteExport[];
        }
        /**
         * adapted from cortex
         */
        export interface Rule {
            evaluationTime?: number; // double
            folderUid: string;
            health: string;
            labels?: /**
             * Labels is a sorted set of labels. Order has to be guaranteed upon
             * instantiation.
             */
            Labels;
            lastError?: string;
            lastEvaluation?: string; // date-time
            name: string;
            query: string;
            type: string;
            uid: string;
        }
        export interface RuleDiscovery {
            groupNextToken?: string;
            groups: RuleGroup[];
            totals?: {
                [name: string]: number; // int64
            };
        }
        export interface RuleGroup {
            evaluationTime?: number; // double
            file: string;
            folderUid: string;
            interval: number; // double
            lastEvaluation?: string; // date-time
            name: string;
            /**
             * In order to preserve rule ordering, while exposing type (alerting or recording)
             * specific properties, both alerting and recording rules are exposed in the
             * same array.
             */
            rules: /* adapted from cortex */ AlertingRule[];
            totals?: {
                [name: string]: number; // int64
            };
        }
        export interface RuleGroupConfigResponse {
            align_evaluation_time_on_interval?: boolean;
            evaluation_delay?: string;
            interval?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            limit?: number; // int64
            name?: string;
            query_offset?: string;
            rules?: GettableExtendedRuleNode[];
            source_tenants?: string[];
        }
        export interface RuleResponse {
            data?: RuleDiscovery;
            error?: string;
            errorType?: /* ErrorType models the different API error types. */ ErrorType;
            status: string;
        }
        export interface SNSConfig {
            api_url?: string;
            attributes?: {
                [name: string]: string;
            };
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            message?: string;
            phone_number?: string;
            send_resolved?: boolean;
            sigv4?: /**
             * SigV4Config is the configuration for signing remote write requests with
             * AWS's SigV4 verification process. Empty values will be retrieved using the
             * AWS default credentials chain.
             */
            SigV4Config;
            subject?: string;
            target_arn?: string;
            topic_arn?: string;
        }
        /**
         * Sample is a single sample belonging to a metric. It represents either a float
         * sample or a histogram sample. If H is nil, it is a float sample. Otherwise,
         * it is a histogram sample.
         */
        export interface Sample {
            /**
             * DropName is used to indicate whether the __name__ label should be dropped
             * as part of the query evaluation.
             */
            DropName?: boolean;
            F?: number; // double
            H?: /**
             * FloatHistogram is similar to Histogram but uses float64 for all
             * counts. Additionally, bucket counts are absolute and not deltas.
             * A FloatHistogram is needed by PromQL to handle operations that might result
             * in fractional counts. Since the counts in a histogram are unlikely to be too
             * large to be represented precisely by a float64, a FloatHistogram can also be
             * used to represent a histogram with integer counts and thus serves as a more
             * generalized representation.
             */
            FloatHistogram;
            Metric?: /**
             * Labels is a sorted set of labels. Order has to be guaranteed upon
             * instantiation.
             */
            Labels;
            T?: number; // int64
        }
        export interface SaveDashboardCommand {
            UpdatedAt?: string; // date-time
            dashboard?: Json;
            /**
             * Deprecated: use FolderUID instead
             */
            folderId?: number; // int64
            folderUid?: string;
            isFolder?: boolean;
            message?: string;
            overwrite?: boolean;
            userId?: number; // int64
        }
        export interface SearchDTO {
            action?: string;
            basicRole?: string;
            onlyRoles?: boolean;
            roleName?: string;
            scope?: string;
            teamId?: string;
            userId?: string;
        }
        export interface SearchDeviceQueryResult {
            devices?: DeviceSearchHitDTO[];
            page?: number; // int64
            perPage?: number; // int64
            totalCount?: number; // int64
        }
        /**
         * swagger: model
         */
        export interface SearchOrgServiceAccountsResult {
            page?: number; // int64
            perPage?: number; // int64
            serviceAccounts?: /* swagger: model */ ServiceAccountDTO[];
            /**
             * It can be used for pagination of the user list
             * E.g. if totalCount is equal to 100 users and
             * the perpage parameter is set to 10 then there are 10 pages of users.
             */
            totalCount?: number; // int64
        }
        export interface SearchOrgUsersQueryResult {
            orgUsers?: OrgUserDTO[];
            page?: number; // int64
            perPage?: number; // int64
            totalCount?: number; // int64
        }
        export interface SearchResult {
            result?: SearchResultItem[];
        }
        export interface SearchResultItem {
            action?: string;
            basicRole?: string;
            orgId?: number; // int64
            roleName?: string;
            scope?: string;
            teamId?: number; // int64
            userId?: number; // int64
            version?: number; // int64
        }
        export interface SearchTeamQueryResult {
            page?: number; // int64
            perPage?: number; // int64
            teams?: TeamDTO[];
            totalCount?: number; // int64
        }
        export interface SearchUserQueryResult {
            page?: number; // int64
            perPage?: number; // int64
            totalCount?: number; // int64
            users?: UserSearchHitDTO[];
        }
        /**
         * Secret special type for storing secrets.
         */
        export type Secret = string;
        export type SecretURL = /**
         * A URL represents a parsed URL (technically, a URI reference).
         * The general form represented is:
         *
         * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
         *
         * URLs that do not start with a slash after the scheme are interpreted as:
         *
         * scheme:opaque[?query][#fragment]
         *
         * The Host field contains the host and port subcomponents of the URL.
         * When the port is present, it is separated from the host with a colon.
         * When the host is an IPv6 address, it must be enclosed in square brackets:
         * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
         * into a string suitable for the Host field, adding square brackets to
         * the host when necessary.
         *
         * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
         * A consequence is that it is impossible to tell which slashes in the Path were
         * slashes in the raw URL and which were %2f. This distinction is rarely important,
         * but when it is, the code should use the [URL.EscapedPath] method, which preserves
         * the original encoding of Path.
         *
         * The RawPath field is an optional field which is only set when the default
         * encoding of Path is different from the escaped path. See the EscapedPath method
         * for more details.
         *
         * URL's String method uses the EscapedPath method to obtain the path.
         */
        URL;
        /**
         * swagger: model
         */
        export interface ServiceAccountDTO {
            /**
             * example:
             * {
             *   "serviceaccounts:delete": true,
             *   "serviceaccounts:read": true,
             *   "serviceaccounts:write": true
             * }
             */
            accessControl?: {
                [name: string]: boolean;
            };
            /**
             * example:
             * /avatar/85ec38023d90823d3e5b43ef35646af9
             */
            avatarUrl?: string;
            id?: number; // int64
            /**
             * example:
             * false
             */
            isDisabled?: boolean;
            /**
             * example:
             * false
             */
            isExternal?: boolean;
            /**
             * example:
             * sa-grafana
             */
            login?: string;
            /**
             * example:
             * grafana
             */
            name?: string;
            /**
             * example:
             * 1
             */
            orgId?: number; // int64
            /**
             * example:
             * Viewer
             */
            role?: string;
            /**
             * example:
             * 0
             */
            tokens?: number; // int64
            /**
             * example:
             * fe1xejlha91xce
             */
            uid?: string;
        }
        export interface ServiceAccountProfileDTO {
            accessControl?: {
                [name: string]: boolean;
            };
            /**
             * example:
             * /avatar/8ea890a677d6a223c591a1beea6ea9d2
             */
            avatarUrl?: string;
            /**
             * example:
             * 2022-03-21T14:35:33Z
             */
            createdAt?: string; // date-time
            /**
             * example:
             * 2
             */
            id?: number; // int64
            /**
             * example:
             * false
             */
            isDisabled?: boolean;
            /**
             * example:
             * false
             */
            isExternal?: boolean;
            /**
             * example:
             * sa-grafana
             */
            login?: string;
            /**
             * example:
             * test
             */
            name?: string;
            /**
             * example:
             * 1
             */
            orgId?: number; // int64
            /**
             * example:
             * grafana-app
             */
            requiredBy?: string;
            /**
             * example:
             * Editor
             */
            role?: string;
            /**
             * example:
             * []
             */
            teams?: string[];
            tokens?: number; // int64
            /**
             * example:
             * fe1xejlha91xce
             */
            uid?: string;
            /**
             * example:
             * 2022-03-21T14:35:33Z
             */
            updatedAt?: string; // date-time
        }
        export interface SetPermissionCommand {
            permission?: string;
        }
        export interface SetPermissionsCommand {
            permissions?: SetResourcePermissionCommand[];
        }
        export interface SetResourcePermissionCommand {
            builtInRole?: string;
            permission?: string;
            teamId?: number; // int64
            userId?: number; // int64
        }
        export interface SetRoleAssignmentsCommand {
            service_accounts?: number /* int64 */[];
            teams?: number /* int64 */[];
            users?: number /* int64 */[];
        }
        export interface SetTeamMembershipsCommand {
            admins?: string[];
            members?: string[];
        }
        export interface SetUserRolesCommand {
            global?: boolean;
            includeHidden?: boolean;
            roleUids?: string[];
        }
        export interface SettingsBag {
            [name: string]: {
                [name: string]: string;
            };
        }
        export type ShareType = string;
        /**
         * SigV4Config is the configuration for signing remote write requests with
         * AWS's SigV4 verification process. Empty values will be retrieved using the
         * AWS default credentials chain.
         */
        export interface SigV4Config {
            AccessKey?: string;
            Profile?: string;
            Region?: string;
            RoleARN?: string;
            SecretKey?: /* Secret special type for storing secrets. */ Secret;
        }
        export type SignatureAlgorithm = number; // int64
        /**
         * Silence silence
         */
        export interface Silence {
            /**
             * comment
             */
            comment: string;
            /**
             * created by
             */
            createdBy: string;
            /**
             * ends at
             */
            endsAt: string; // date-time
            matchers: /* Matchers matchers */ Matchers;
            /**
             * starts at
             */
            startsAt: string; // date-time
        }
        export interface SilenceMetadata {
            folder_uid?: string;
            rule_title?: string;
            rule_uid?: string;
        }
        /**
         * SilenceStatus silence status
         */
        export interface SilenceStatus {
            /**
             * state
             */
            state: "[expired active pending]";
        }
        /**
         * SlackAction configures a single Slack action that is sent with each notification.
         * See https://api.slack.com/docs/message-attachments#action_fields and https://api.slack.com/docs/message-buttons
         * for more information.
         */
        export interface SlackAction {
            confirm?: /**
             * SlackConfirmationField protect users from destructive actions or particularly distinguished decisions
             * by asking them to confirm their button click one more time.
             * See https://api.slack.com/docs/interactive-message-field-guide#confirmation_fields for more information.
             */
            SlackConfirmationField;
            name?: string;
            style?: string;
            text?: string;
            type?: string;
            url?: string;
            value?: string;
        }
        /**
         * SlackConfig configures notifications via Slack.
         */
        export interface SlackConfig {
            actions?: /**
             * SlackAction configures a single Slack action that is sent with each notification.
             * See https://api.slack.com/docs/message-attachments#action_fields and https://api.slack.com/docs/message-buttons
             * for more information.
             */
            SlackAction[];
            api_url?: SecretURL;
            api_url_file?: string;
            callback_id?: string;
            /**
             * Slack channel override, (like #other-channel or @username).
             */
            channel?: string;
            color?: string;
            fallback?: string;
            fields?: /**
             * SlackField configures a single Slack field that is sent with each notification.
             * Each field must contain a title, value, and optionally, a boolean value to indicate if the field
             * is short enough to be displayed next to other fields designated as short.
             * See https://api.slack.com/docs/message-attachments#fields for more information.
             */
            SlackField[];
            footer?: string;
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            icon_emoji?: string;
            icon_url?: string;
            image_url?: string;
            link_names?: boolean;
            mrkdwn_in?: string[];
            pretext?: string;
            send_resolved?: boolean;
            short_fields?: boolean;
            text?: string;
            thumb_url?: string;
            title?: string;
            title_link?: string;
            username?: string;
        }
        /**
         * SlackConfirmationField protect users from destructive actions or particularly distinguished decisions
         * by asking them to confirm their button click one more time.
         * See https://api.slack.com/docs/interactive-message-field-guide#confirmation_fields for more information.
         */
        export interface SlackConfirmationField {
            dismiss_text?: string;
            ok_text?: string;
            text?: string;
            title?: string;
        }
        /**
         * SlackField configures a single Slack field that is sent with each notification.
         * Each field must contain a title, value, and optionally, a boolean value to indicate if the field
         * is short enough to be displayed next to other fields designated as short.
         * See https://api.slack.com/docs/message-attachments#fields for more information.
         */
        export interface SlackField {
            short?: boolean;
            title?: string;
            value?: string;
        }
        export type SmtpNotEnabled = ResponseDetails;
        /**
         * Base snapshot without results
         */
        export interface SnapshotDTO {
            created?: string; // date-time
            finished?: string; // date-time
            sessionUid?: string;
            status?: "INITIALIZING" | "CREATING" | "PENDING_UPLOAD" | "UPLOADING" | "PENDING_PROCESSING" | "PROCESSING" | "FINISHED" | "CANCELED" | "ERROR" | "UNKNOWN";
            uid?: string;
        }
        export interface SnapshotListResponseDTO {
            snapshots?: /* Base snapshot without results */ SnapshotDTO[];
        }
        export interface SnapshotResourceStats {
            statuses?: {
                [name: string]: number; // int64
            };
            total?: number; // int64
            types?: {
                [name: string]: number; // int64
            };
        }
        /**
         * Source type defines the status source.
         */
        export type Source = string;
        /**
         * A Span defines a continuous sequence of buckets.
         */
        export interface Span {
            /**
             * Length of the span.
             */
            Length?: number; // uint32
            /**
             * Gap to previous span (always positive), or starting index for the 1st
             * span (which can be negative).
             */
            Offset?: number; // int32
        }
        /**
         * +enum
         */
        export type State = string;
        export type Status = number; // int64
        export type Success = ResponseDetails;
        export interface SuccessResponseBody {
            message?: string;
        }
        export type SupportedTransformationTypes = string;
        /**
         * SyncResult holds the result of a sync with LDAP. This gives us information on which users were updated and how.
         */
        export interface SyncResult {
            Elapsed?: /**
             * A Duration represents the elapsed time between two instants
             * as an int64 nanosecond count. The representation limits the
             * largest representable duration to approximately 290 years.
             */
            Duration /* int64 */;
            FailedUsers?: /* FailedUser holds the information of an user that failed */ FailedUser[];
            MissingUserIds?: number /* int64 */[];
            Started?: string; // date-time
            UpdatedUserIds?: number /* int64 */[];
        }
        /**
         * TLSConfig configures the options for TLS connections.
         */
        export interface TLSConfig {
            /**
             * Text of the CA cert to use for the targets.
             */
            ca?: string;
            /**
             * The CA cert to use for the targets.
             */
            ca_file?: string;
            /**
             * CARef is the name of the secret within the secret manager to use as the CA cert for the
             * targets.
             */
            ca_ref?: string;
            /**
             * Text of the client cert file for the targets.
             */
            cert?: string;
            /**
             * The client cert file for the targets.
             */
            cert_file?: string;
            /**
             * CertRef is the name of the secret within the secret manager to use as the client cert for
             * the targets.
             */
            cert_ref?: string;
            /**
             * Disable target certificate validation.
             */
            insecure_skip_verify?: boolean;
            key?: /* Secret special type for storing secrets. */ Secret;
            /**
             * The client key file for the targets.
             */
            key_file?: string;
            /**
             * KeyRef is the name of the secret within the secret manager to use as the client key for
             * the targets.
             */
            key_ref?: string;
            max_version?: TLSVersion /* uint16 */;
            min_version?: TLSVersion /* uint16 */;
            /**
             * Used to verify the hostname for the targets.
             */
            server_name?: string;
        }
        export type TLSVersion = number; // uint16
        /**
         * TagsDTO is the frontend DTO for Tag.
         */
        export interface TagsDTO {
            count?: number; // int64
            tag?: string;
        }
        export interface TeamDTO {
            accessControl?: {
                [name: string]: boolean;
            };
            avatarUrl?: string;
            email?: string;
            id?: number; // int64
            memberCount?: number; // int64
            name?: string;
            orgId?: number; // int64
            permission?: PermissionType /* int64 */;
            uid?: string;
        }
        export interface TeamGroupDTO {
            groupId?: string;
            orgId?: number; // int64
            teamId?: number; // int64
        }
        export interface TeamGroupMapping {
            groupId?: string;
        }
        export interface TeamLBACRule {
            rules?: string[];
            teamId?: string;
            teamUid?: string;
        }
        export interface TeamLBACRules {
            rules?: TeamLBACRule[];
        }
        export interface TeamMemberDTO {
            auth_module?: string;
            avatarUrl?: string;
            email?: string;
            labels?: string[];
            login?: string;
            name?: string;
            orgId?: number; // int64
            permission?: PermissionType /* int64 */;
            teamId?: number; // int64
            teamUID?: string;
            userId?: number; // int64
        }
        /**
         * TelegramConfig configures notifications via Telegram.
         */
        export interface TelegramConfig {
            api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            chat?: number; // int64
            disable_notifications?: boolean;
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            message?: string;
            parse_mode?: string;
            send_resolved?: boolean;
            token?: /* Secret special type for storing secrets. */ Secret;
            token_file?: string;
        }
        export interface TempUserDTO {
            code?: string;
            createdOn?: string; // date-time
            email?: string;
            emailSent?: boolean;
            emailSentOn?: string; // date-time
            id?: number; // int64
            invitedByEmail?: string;
            invitedByLogin?: string;
            invitedByName?: string;
            name?: string;
            orgId?: number; // int64
            role?: "None" | "Viewer" | "Editor" | "Admin";
            status?: TempUserStatus;
            url?: string;
        }
        export type TempUserStatus = string;
        export interface TestReceiverConfigResult {
            error?: string;
            name?: string;
            status?: string;
            uid?: string;
        }
        export interface TestReceiverResult {
            grafana_managed_receiver_configs?: TestReceiverConfigResult[];
            name?: string;
        }
        export interface TestReceiversConfigAlertParams {
            annotations?: /**
             * A LabelSet is a collection of LabelName and LabelValue pairs.  The LabelSet
             * may be fully-qualified down to the point where it may resolve to a single
             * Metric in the data store or not.  All operations that occur within the realm
             * of a LabelSet can emit a vector of Metric entities to which the LabelSet may
             * match.
             */
            LabelSet;
            labels?: /**
             * A LabelSet is a collection of LabelName and LabelValue pairs.  The LabelSet
             * may be fully-qualified down to the point where it may resolve to a single
             * Metric in the data store or not.  All operations that occur within the realm
             * of a LabelSet can emit a vector of Metric entities to which the LabelSet may
             * match.
             */
            LabelSet;
        }
        export interface TestReceiversConfigBodyParams {
            alert?: TestReceiversConfigAlertParams;
            receivers?: /* nolint:revive */ PostableApiReceiver[];
        }
        export interface TestReceiversResult {
            alert?: TestReceiversConfigAlertParams;
            notified_at?: string; // date-time
            receivers?: TestReceiverResult[];
        }
        export interface TestRulePayload {
            /**
             * example:
             * (node_filesystem_avail_bytes{fstype!="",job="integrations/node_exporter"} node_filesystem_size_bytes{fstype!="",job="integrations/node_exporter"} * 100 < 5 and node_filesystem_readonly{fstype!="",job="integrations/node_exporter"} == 0)
             */
            expr?: string;
            grafana_condition?: /* EvalAlertConditionCommand is the command for evaluating a condition */ EvalAlertConditionCommand;
        }
        export interface TestRuleResponse {
            alerts?: /**
             * Vector is basically only an alias for []Sample, but the contract is that
             * in a Vector, all Samples have the same timestamp.
             */
            Vector;
            grafana_alert_instances?: AlertInstancesResponse;
        }
        export interface TestTemplatesConfigBodyParams {
            /**
             * Alerts to use as data when testing the template.
             */
            alerts?: /* PostableAlert postable alert */ PostableAlert[];
            /**
             * Name of the template file.
             */
            name?: string;
            /**
             * Template string to test.
             */
            template?: string;
        }
        export interface TestTemplatesErrorResult {
            /**
             * Kind of template error that occurred.
             */
            kind?: "invalid_template" | "execution_error";
            /**
             * Error message.
             */
            message?: string;
            /**
             * Name of the associated template for this error. Will be empty if the Kind is "invalid_template".
             */
            name?: string;
        }
        export interface TestTemplatesResult {
            /**
             * Name of the associated template definition for this result.
             */
            name?: string;
            /**
             * Scope that was successfully used to interpolate the template. If the root scope "." fails, more specific
             * scopes will be tried, such as ".Alerts', or ".Alert".
             */
            scope?: "." | ".Alerts" | ".Alert";
            /**
             * Interpolated value of the template.
             */
            text?: string;
        }
        export interface TestTemplatesResults {
            errors?: TestTemplatesErrorResult[];
            results?: TestTemplatesResult[];
        }
        /**
         * Threshold a single step on the threshold list
         */
        export interface Threshold {
            color?: string;
            state?: string;
            value?: /**
             * ConfFloat64 is a float64. It Marshals float64 values of NaN of Inf
             * to null.
             */
            ConfFloat64 /* double */;
        }
        /**
         * ThresholdsConfig setup thresholds
         */
        export interface ThresholdsConfig {
            mode?: /* ThresholdsMode absolute or percentage */ ThresholdsMode;
            /**
             * Must be sorted by 'value', first value is always -Infinity
             */
            steps?: /* Threshold a single step on the threshold list */ Threshold[];
        }
        /**
         * ThresholdsMode absolute or percentage
         */
        export type ThresholdsMode = string;
        /**
         * TimeInterval represents a named set of time intervals for which a route should be muted.
         */
        export interface TimeInterval {
            name?: string;
            time_intervals?: /* TimeInterval represents a named set of time intervals for which a route should be muted. */ TimeInterval[];
        }
        export interface TimeIntervalItem {
            days_of_month?: string[];
            location?: string;
            months?: string[];
            times?: TimeIntervalTimeRange[];
            weekdays?: string[];
            years?: string[];
        }
        export interface TimeIntervalTimeRange {
            end_time?: string;
            start_time?: string;
        }
        /**
         * Redefining this to avoid an import cycle
         */
        export interface TimeRange {
            from?: string; // date-time
            to?: string; // date-time
        }
        export interface Token {
            account?: string;
            anonymousRatio?: number; // int64
            company?: string;
            details_url?: string;
            exp?: number; // int64
            iat?: number; // int64
            included_users?: number; // int64
            iss?: string;
            jti?: string;
            lexp?: number; // int64
            lic_exp_warn_days?: number; // int64
            lid?: string;
            limit_by?: string;
            max_concurrent_user_sessions?: number; // int64
            nbf?: number; // int64
            prod?: string[];
            slug?: string;
            status?: TokenStatus /* int64 */;
            sub?: string;
            tok_exp_warn_days?: number; // int64
            trial?: boolean;
            trial_exp?: number; // int64
            update_days?: number; // int64
            usage_billing?: boolean;
        }
        export interface TokenDTO {
            /**
             * example:
             * 2022-03-23T10:31:02Z
             */
            created?: string; // date-time
            /**
             * example:
             * 2022-03-23T10:31:02Z
             */
            expiration?: string; // date-time
            /**
             * example:
             * false
             */
            hasExpired?: boolean;
            /**
             * example:
             * 1
             */
            id?: number; // int64
            /**
             * example:
             * false
             */
            isRevoked?: boolean;
            /**
             * example:
             * 2022-03-23T10:31:02Z
             */
            lastUsedAt?: string; // date-time
            /**
             * example:
             * grafana
             */
            name?: string;
            /**
             * example:
             * 0
             */
            secondsUntilExpiration?: number; // double
        }
        export type TokenStatus = number; // int64
        export interface Transformation {
            expression?: string;
            field?: string;
            mapValue?: string;
            type?: "regex" | "logfmt";
        }
        export type Transformations = Transformation[];
        /**
         * +enum
         */
        export type Type = string;
        /**
         * TypeMeta describes an individual object in an API response or request
         * with strings representing the type of the object and its API schema version.
         * Structures that are versioned or persisted should inline TypeMeta.
         * +k8s:deepcopy-gen=false
         */
        export interface TypeMeta {
            /**
             * APIVersion defines the versioned schema of this representation of an object.
             * Servers should convert recognized schemas to the latest internal value, and
             * may reject unrecognized values.
             * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
             * +optional
             */
            apiVersion?: string;
            /**
             * Kind is a string value representing the REST resource this object represents.
             * Servers may infer this from the endpoint the client submits requests to.
             * Cannot be updated.
             * In CamelCase.
             * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
             * +optional
             */
            kind?: string;
        }
        /**
         * A URL represents a parsed URL (technically, a URI reference).
         * The general form represented is:
         *
         * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
         *
         * URLs that do not start with a slash after the scheme are interpreted as:
         *
         * scheme:opaque[?query][#fragment]
         *
         * The Host field contains the host and port subcomponents of the URL.
         * When the port is present, it is separated from the host with a colon.
         * When the host is an IPv6 address, it must be enclosed in square brackets:
         * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
         * into a string suitable for the Host field, adding square brackets to
         * the host when necessary.
         *
         * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
         * A consequence is that it is impossible to tell which slashes in the Path were
         * slashes in the raw URL and which were %2f. This distinction is rarely important,
         * but when it is, the code should use the [URL.EscapedPath] method, which preserves
         * the original encoding of Path.
         *
         * The RawPath field is an optional field which is only set when the default
         * encoding of Path is different from the escaped path. See the EscapedPath method
         * for more details.
         *
         * URL's String method uses the EscapedPath method to obtain the path.
         */
        export interface URL {
            ForceQuery?: boolean;
            Fragment?: string;
            Host?: string;
            OmitHost?: boolean;
            Opaque?: string;
            Path?: string;
            RawFragment?: string;
            RawPath?: string;
            RawQuery?: string;
            Scheme?: string;
            User?: /**
             * The Userinfo type is an immutable encapsulation of username and
             * password details for a [URL]. An existing Userinfo value is guaranteed
             * to have a username set (potentially empty, as allowed by RFC 2396),
             * and optionally a password.
             */
            Userinfo;
        }
        /**
         * Unstructured allows objects that do not have Golang structs registered to be manipulated
         * generically.
         */
        export interface Unstructured {
            /**
             * Object is a JSON compatible map with string, float, int, bool, []interface{},
             * or map[string]interface{} children.
             */
            Object?: {
                [name: string]: any;
            };
        }
        export interface UpdateAnnotationsCmd {
            data?: Json;
            id?: number; // int64
            tags?: string[];
            text?: string;
            time?: number; // int64
            timeEnd?: number; // int64
        }
        /**
         * UpdateCorrelationCommand is the command for updating a correlation
         */
        export interface UpdateCorrelationCommand {
            config?: CorrelationConfigUpdateDTO;
            /**
             * Optional description of the correlation
             * example:
             * Logs to Traces
             */
            description?: string;
            /**
             * Optional label identifying the correlation
             * example:
             * My label
             */
            label?: string;
            type?: /**
             * the type of correlation, either query for containing query information, or external for containing an external URL
             * +enum
             */
            CorrelationType;
        }
        export interface UpdateCorrelationResponseBody {
            /**
             * example:
             * Correlation updated
             */
            message?: string;
            result?: /* Correlation is the model for correlations definitions */ Correlation;
        }
        export interface UpdateDashboardACLCommand {
            items?: DashboardACLUpdateItem[];
        }
        /**
         * Also acts as api DTO
         */
        export interface UpdateDataSourceCommand {
            access?: DsAccess;
            basicAuth?: boolean;
            basicAuthUser?: string;
            database?: string;
            isDefault?: boolean;
            jsonData?: Json;
            name?: string;
            secureJsonData?: {
                [name: string]: string;
            };
            type?: string;
            uid?: string;
            url?: string;
            user?: string;
            version?: number; // int64
            withCredentials?: boolean;
        }
        /**
         * UpdateFolderCommand captures the information required by the folder service
         * to update a folder. Use Move to update a folder's parent folder.
         */
        export interface UpdateFolderCommand {
            /**
             * NewDescription it's an optional parameter used for overriding the existing folder description
             */
            description?: string;
            /**
             * Overwrite only used by the legacy folder implementation
             */
            overwrite?: boolean;
            /**
             * NewTitle it's an optional parameter used for overriding the existing folder title
             */
            title?: string;
            /**
             * Version only used by the legacy folder implementation
             */
            version?: number; // int64
        }
        export interface UpdateOrgAddressForm {
            address1?: string;
            address2?: string;
            city?: string;
            country?: string;
            state?: string;
            zipcode?: string;
        }
        export interface UpdateOrgForm {
            name?: string;
        }
        export interface UpdateOrgUserCommand {
            role?: "None" | "Viewer" | "Editor" | "Admin";
        }
        export interface UpdatePlaylistCommand {
            interval?: string;
            items?: PlaylistItem[];
            name?: string;
            uid?: string;
        }
        export interface UpdatePrefsCmd {
            cookies?: CookieType[];
            /**
             * The numerical :id of a favorited dashboard
             */
            homeDashboardId?: number; // int64
            homeDashboardUID?: string;
            language?: string;
            navbar?: NavbarPreference;
            queryHistory?: QueryHistoryPreference;
            theme?: "light" | "dark" | "system";
            timezone?: "utc" | "browser";
            weekStart?: string;
        }
        export interface UpdateQuotaCmd {
            limit?: number; // int64
            target?: string;
        }
        export interface UpdateRoleCommand {
            description?: string;
            displayName?: string;
            global?: boolean;
            group?: string;
            hidden?: boolean;
            name?: string;
            permissions?: /* Permission is the model for access control permissions. */ Permission[];
            version?: number; // int64
        }
        export interface UpdateRuleGroupResponse {
            created?: string[];
            deleted?: string[];
            message?: string;
            updated?: string[];
        }
        export interface UpdateServiceAccountForm {
            isDisabled?: boolean;
            name?: string;
            role?: "None" | "Viewer" | "Editor" | "Admin";
            serviceAccountId?: number; // int64
        }
        export interface UpdateTeamCommand {
            Email?: string;
            ID?: number; // int64
            Name?: string;
        }
        export interface UpdateTeamLBACCommand {
            rules?: TeamLBACRule[];
        }
        export interface UpdateTeamMemberCommand {
            permission?: PermissionType /* int64 */;
        }
        export interface UpdateUserCommand {
            email?: string;
            login?: string;
            name?: string;
            theme?: string;
        }
        /**
         * UserInfo represents user-related information, including a unique identifier and a name.
         */
        export interface UserInfo {
            name?: string;
            uid?: string;
        }
        export interface UserLookupDTO {
            avatarUrl?: string;
            login?: string;
            uid?: string;
            userId?: number; // int64
        }
        export interface UserOrgDTO {
            name?: string;
            orgId?: number; // int64
            role?: "None" | "Viewer" | "Editor" | "Admin";
        }
        export interface UserProfileDTO {
            accessControl?: {
                [name: string]: boolean;
            };
            authLabels?: string[];
            avatarUrl?: string;
            createdAt?: string; // date-time
            email?: string;
            id?: number; // int64
            isDisabled?: boolean;
            isExternal?: boolean;
            isExternallySynced?: boolean;
            isGrafanaAdmin?: boolean;
            isGrafanaAdminExternallySynced?: boolean;
            login?: string;
            name?: string;
            orgId?: number; // int64
            theme?: string;
            uid?: string;
            updatedAt?: string; // date-time
        }
        export interface UserSearchHitDTO {
            authLabels?: string[];
            avatarUrl?: string;
            email?: string;
            id?: number; // int64
            isAdmin?: boolean;
            isDisabled?: boolean;
            lastSeenAt?: string; // date-time
            lastSeenAtAge?: string;
            login?: string;
            name?: string;
            uid?: string;
        }
        /**
         * UserToken represents a user token
         */
        export interface UserToken {
            AuthToken?: string;
            AuthTokenSeen?: boolean;
            ClientIp?: string;
            CreatedAt?: number; // int64
            ExternalSessionId?: number; // int64
            Id?: number; // int64
            PrevAuthToken?: string;
            RevokedAt?: number; // int64
            RotatedAt?: number; // int64
            SeenAt?: number; // int64
            UnhashedToken?: string;
            UpdatedAt?: number; // int64
            UserAgent?: string;
            UserId?: number; // int64
        }
        /**
         * The Userinfo type is an immutable encapsulation of username and
         * password details for a [URL]. An existing Userinfo value is guaranteed
         * to have a username set (potentially empty, as allowed by RFC 2396),
         * and optionally a password.
         */
        export interface Userinfo {
        }
        export interface ValidationError {
            /**
             * example:
             * error message
             */
            message?: string;
        }
        /**
         * ValueMapping allows mapping input values to text and color
         */
        export interface ValueMapping {
        }
        export type ValueMappings = /* ValueMapping allows mapping input values to text and color */ ValueMapping[];
        /**
         * Vector is basically only an alias for []Sample, but the contract is that
         * in a Vector, all Samples have the same timestamp.
         */
        export type Vector = /**
         * Sample is a single sample belonging to a metric. It represents either a float
         * sample or a histogram sample. If H is nil, it is a float sample. Otherwise,
         * it is a histogram sample.
         */
        Sample[];
        /**
         * VersionInfo version info
         */
        export interface VersionInfo {
            /**
             * branch
             */
            branch: string;
            /**
             * build date
             */
            buildDate: string;
            /**
             * build user
             */
            buildUser: string;
            /**
             * go version
             */
            goVersion: string;
            /**
             * revision
             */
            revision: string;
            /**
             * version
             */
            version: string;
        }
        /**
         * VictorOpsConfig configures notifications via VictorOps.
         */
        export interface VictorOpsConfig {
            api_key?: /* Secret special type for storing secrets. */ Secret;
            api_key_file?: string;
            api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            custom_fields?: {
                [name: string]: string;
            };
            entity_display_name?: string;
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            message_type?: string;
            monitoring_tool?: string;
            routing_key?: string;
            send_resolved?: boolean;
            state_message?: string;
        }
        /**
         * VisType is used to indicate how the data should be visualized in explore.
         */
        export type VisType = string;
        /**
         * WebexConfig configures notifications via Webex.
         */
        export interface WebexConfig {
            api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            message?: string;
            room_id?: string;
            send_resolved?: boolean;
        }
        /**
         * WebhookConfig configures notifications via a generic webhook.
         */
        export interface WebhookConfig {
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            /**
             * MaxAlerts is the maximum number of alerts to be sent per webhook message.
             * Alerts exceeding this threshold will be truncated. Setting this to 0
             * allows an unlimited number of alerts.
             */
            max_alerts?: number; // uint64
            send_resolved?: boolean;
            url?: SecretURL;
            url_file?: string;
        }
        /**
         * WechatConfig configures notifications via Wechat.
         */
        export interface WechatConfig {
            agent_id?: string;
            api_secret?: /* Secret special type for storing secrets. */ Secret;
            api_url?: /**
             * A URL represents a parsed URL (technically, a URI reference).
             * The general form represented is:
             *
             * [scheme:][//[userinfo@]host][/]path[?query][#fragment]
             *
             * URLs that do not start with a slash after the scheme are interpreted as:
             *
             * scheme:opaque[?query][#fragment]
             *
             * The Host field contains the host and port subcomponents of the URL.
             * When the port is present, it is separated from the host with a colon.
             * When the host is an IPv6 address, it must be enclosed in square brackets:
             * "[fe80::1]:80". The [net.JoinHostPort] function combines a host and port
             * into a string suitable for the Host field, adding square brackets to
             * the host when necessary.
             *
             * Note that the Path field is stored in decoded form: /%47%6f%2f becomes /Go/.
             * A consequence is that it is impossible to tell which slashes in the Path were
             * slashes in the raw URL and which were %2f. This distinction is rarely important,
             * but when it is, the code should use the [URL.EscapedPath] method, which preserves
             * the original encoding of Path.
             *
             * The RawPath field is an optional field which is only set when the default
             * encoding of Path is different from the escaped path. See the EscapedPath method
             * for more details.
             *
             * URL's String method uses the EscapedPath method to obtain the path.
             */
            URL;
            corp_id?: string;
            http_config?: /* HTTPClientConfig configures an HTTP client. */ HTTPClientConfig;
            message?: string;
            message_type?: string;
            send_resolved?: boolean;
            to_party?: string;
            to_tag?: string;
            to_user?: string;
        }
    }
}
declare namespace Paths {
    namespace AddAPIkey {
        namespace Responses {
            export type $410 = Components.Responses.GoneError;
        }
    }
    namespace AddDataSource {
        export type RequestBody = /* Also acts as api DTO */ Components.Schemas.AddDataSourceCommand;
        namespace Responses {
            export type $200 = Components.Responses.CreateOrUpdateDatasourceResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AddOrgInvite {
        export type RequestBody = Components.Schemas.AddInviteForm;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $412 = Components.Responses.SMTPNotEnabledError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AddOrgUser {
        namespace Parameters {
            export type OrgId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
        }
        export type RequestBody = Components.Schemas.AddOrgUserCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AddOrgUserToCurrentOrg {
        export type RequestBody = Components.Schemas.AddOrgUserCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AddTeamGroupApi {
        namespace Parameters {
            export type TeamId = number; // int64
        }
        export interface PathParameters {
            teamId: Parameters.TeamId /* int64 */;
        }
        export type RequestBody = Components.Schemas.TeamGroupMapping;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AddTeamMember {
        namespace Parameters {
            export type TeamId = string;
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
        }
        export type RequestBody = Components.Schemas.AddTeamMemberCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AddTeamRole {
        namespace Parameters {
            export type TeamId = number; // int64
        }
        export interface PathParameters {
            teamId: Parameters.TeamId /* int64 */;
        }
        export type RequestBody = Components.Schemas.AddTeamRoleCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AddUserRole {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            userId: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.AddUserRoleCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminCreateUser {
        export type RequestBody = Components.Schemas.AdminCreateUserForm;
        namespace Responses {
            export type $200 = Components.Responses.AdminCreateUserResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $412 = Components.Responses.PreconditionFailedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminDeleteUser {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminDisableUser {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminEnableUser {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminGetSettings {
        namespace Responses {
            export type $200 = Components.Responses.AdminGetSettingsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
        }
    }
    namespace AdminGetStats {
        namespace Responses {
            export type $200 = Components.Responses.AdminGetStatsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminGetUserAuthTokens {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.AdminGetUserAuthTokensResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminLogoutUser {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminProvisioningReloadAccessControl {
        namespace Responses {
            export type $202 = Components.Responses.AcceptedResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
        }
    }
    namespace AdminProvisioningReloadDashboards {
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminProvisioningReloadDatasources {
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminProvisioningReloadPlugins {
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminRevokeUserAuthToken {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.RevokeAuthTokenCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminUpdateUserPassword {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.AdminUpdateUserPasswordForm;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace AdminUpdateUserPermissions {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.AdminUpdateUserPermissionsForm;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CalculateDashboardDiff {
        export interface RequestBody {
            base?: Components.Schemas.CalculateDiffTarget;
            /**
             * The type of diff to return
             * Description:
             * `basic`
             * `json`
             */
            diffType?: "basic" | "json";
            new?: Components.Schemas.CalculateDiffTarget;
        }
        namespace Responses {
            export type $200 = Components.Responses.CalculateDashboardDiffResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CallDatasourceResourceByID {
        namespace Parameters {
            export type DatasourceProxyRoute = string;
            export type Id = string;
        }
        export interface PathParameters {
            datasource_proxy_route: Parameters.DatasourceProxyRoute;
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CallDatasourceResourceWithUID {
        namespace Parameters {
            export type DatasourceProxyRoute = string;
            export type Uid = string;
        }
        export interface PathParameters {
            datasource_proxy_route: Parameters.DatasourceProxyRoute;
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CancelSnapshot {
        namespace Parameters {
            export type SnapshotUid = string;
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
            snapshotUid: Parameters.SnapshotUid;
        }
        namespace Responses {
            export interface $200 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ChangeUserPassword {
        export type RequestBody = Components.Schemas.ChangeUserPasswordCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CheckDatasourceHealthByID {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CheckDatasourceHealthWithUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CleanDataSourceCache {
        namespace Parameters {
            export type DataSourceUID = string;
        }
        export interface PathParameters {
            dataSourceUID: Parameters.DataSourceUID;
        }
        namespace Responses {
            export type $200 = Components.Schemas.CacheConfigResponse;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ClearHelpFlags {
        namespace Responses {
            export type $200 = Components.Responses.HelpFlagResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateCloudMigrationToken {
        namespace Responses {
            export type $200 = Components.Responses.CloudMigrationCreateTokenResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateCorrelation {
        namespace Parameters {
            export type SourceUID = string;
        }
        export interface PathParameters {
            sourceUID: Parameters.SourceUID;
        }
        export type RequestBody = /* CreateCorrelationCommand is the command for creating a correlation */ Components.Schemas.CreateCorrelationCommand;
        namespace Responses {
            export type $200 = Components.Responses.CreateCorrelationResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateDashboardSnapshot {
        export type RequestBody = Components.Schemas.CreateDashboardSnapshotCommand;
        namespace Responses {
            export type $200 = Components.Responses.CreateDashboardSnapshotResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateFolder {
        export type RequestBody = /**
         * CreateFolderCommand captures the information required by the folder service
         * to create a folder.
         */
        Components.Schemas.CreateFolderCommand;
        namespace Responses {
            export type $200 = Components.Responses.FolderResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateGroupMappings {
        namespace Parameters {
            export type GroupId = string;
        }
        export interface PathParameters {
            group_id: Parameters.GroupId;
        }
        export type RequestBody = Components.Schemas.GroupAttributes;
        namespace Responses {
            export type $201 = Components.Responses.ApiResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateLibraryElement {
        export type RequestBody = /* CreateLibraryElementCommand is the command for adding a LibraryElement */ Components.Schemas.CreateLibraryElementCommand;
        namespace Responses {
            export type $200 = Components.Responses.GetLibraryElementResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateOrg {
        export type RequestBody = Components.Schemas.CreateOrgCommand;
        namespace Responses {
            export type $200 = Components.Responses.CreateOrgResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreatePlaylist {
        export type RequestBody = Components.Schemas.CreatePlaylistCommand;
        namespace Responses {
            export type $200 = Components.Responses.CreatePlaylistResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreatePublicDashboard {
        namespace Parameters {
            export type DashboardUid = string;
        }
        export interface PathParameters {
            dashboardUid: Parameters.DashboardUid;
        }
        export type RequestBody = Components.Schemas.PublicDashboardDTO;
        namespace Responses {
            export type $200 = Components.Responses.CreatePublicDashboardResponse;
            export type $400 = Components.Responses.BadRequestPublicError;
            export type $401 = Components.Responses.UnauthorisedPublicError;
            export type $403 = Components.Responses.ForbiddenPublicError;
            export type $500 = Components.Responses.InternalServerPublicError;
        }
    }
    namespace CreateQuery {
        export type RequestBody = /* CreateQueryInQueryHistoryCommand is the command for adding query history */ Components.Schemas.CreateQueryInQueryHistoryCommand;
        namespace Responses {
            export type $200 = Components.Responses.GetQueryHistoryResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateRecordingRule {
        export type RequestBody = /* RecordingRuleJSON is the external representation of a recording rule */ Components.Schemas.RecordingRuleJSON;
        namespace Responses {
            export type $200 = Components.Responses.RecordingRuleResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateRecordingRuleWriteTarget {
        export type RequestBody = Components.Schemas.PrometheusRemoteWriteTargetJSON;
        namespace Responses {
            export type $200 = Components.Responses.RecordingRuleWriteTargetResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $422 = Components.Responses.UnprocessableEntityError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateReport {
        export type RequestBody = Components.Schemas.CreateOrUpdateReport;
        namespace Responses {
            export type $200 = Components.Responses.CreateReportResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateRole {
        export type RequestBody = Components.Schemas.CreateRoleForm;
        namespace Responses {
            export type $201 = Components.Responses.CreateRoleResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateServiceAccount {
        export type RequestBody = Components.Schemas.CreateServiceAccountForm;
        namespace Responses {
            export type $201 = Components.Responses.CreateServiceAccountResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateSession {
        export type RequestBody = Components.Schemas.CloudMigrationSessionRequestDTO;
        namespace Responses {
            export type $200 = Components.Responses.CloudMigrationSessionResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateSnapshot {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.CreateSnapshotResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateTeam {
        export type RequestBody = Components.Schemas.CreateTeamCommand;
        namespace Responses {
            export type $200 = Components.Responses.CreateTeamResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace CreateToken {
        namespace Parameters {
            export type ServiceAccountId = number; // int64
        }
        export interface PathParameters {
            serviceAccountId: Parameters.ServiceAccountId /* int64 */;
        }
        export type RequestBody = Components.Schemas.AddServiceAccountTokenCommand;
        namespace Responses {
            export type $200 = Components.Responses.CreateTokenResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DatasourceProxyDELETEByUIDcalls {
        namespace Parameters {
            export type DatasourceProxyRoute = string;
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
            datasource_proxy_route: Parameters.DatasourceProxyRoute;
        }
        namespace Responses {
            export interface $202 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DatasourceProxyDELETEcalls {
        namespace Parameters {
            export type DatasourceProxyRoute = string;
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
            datasource_proxy_route: Parameters.DatasourceProxyRoute;
        }
        namespace Responses {
            export interface $202 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DatasourceProxyGETByUIDcalls {
        namespace Parameters {
            export type DatasourceProxyRoute = string;
            export type Uid = string;
        }
        export interface PathParameters {
            datasource_proxy_route: Parameters.DatasourceProxyRoute;
            uid: Parameters.Uid;
        }
        namespace Responses {
            export interface $200 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DatasourceProxyGETcalls {
        namespace Parameters {
            export type DatasourceProxyRoute = string;
            export type Id = string;
        }
        export interface PathParameters {
            datasource_proxy_route: Parameters.DatasourceProxyRoute;
            id: Parameters.Id;
        }
        namespace Responses {
            export interface $200 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DatasourceProxyPOSTByUIDcalls {
        namespace Parameters {
            export type DatasourceProxyRoute = string;
            export type Uid = string;
        }
        export interface PathParameters {
            datasource_proxy_route: Parameters.DatasourceProxyRoute;
            uid: Parameters.Uid;
        }
        export type RequestBody = any;
        namespace Responses {
            export interface $201 {
            }
            export interface $202 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DatasourceProxyPOSTcalls {
        namespace Parameters {
            export type DatasourceProxyRoute = string;
            export type Id = string;
        }
        export interface PathParameters {
            datasource_proxy_route: Parameters.DatasourceProxyRoute;
            id: Parameters.Id;
        }
        export type RequestBody = any;
        namespace Responses {
            export interface $201 {
            }
            export interface $202 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteAPIkey {
        namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteAnnotationByID {
        namespace Parameters {
            export type AnnotationId = string;
        }
        export interface PathParameters {
            annotation_id: Parameters.AnnotationId;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteCloudMigrationToken {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $204 = Components.Responses.CloudMigrationDeleteTokenResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteCorrelation {
        namespace Parameters {
            export type CorrelationUID = string;
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
            correlationUID: Parameters.CorrelationUID;
        }
        namespace Responses {
            export type $200 = Components.Responses.DeleteCorrelationResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteDashboardByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.DeleteDashboardResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteDashboardSnapshot {
        namespace Parameters {
            export type Key = string;
        }
        export interface PathParameters {
            key: Parameters.Key;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteDashboardSnapshotByDeleteKey {
        namespace Parameters {
            export type DeleteKey = string;
        }
        export interface PathParameters {
            deleteKey: Parameters.DeleteKey;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteDataSourceByID {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteDataSourceByName {
        namespace Parameters {
            export type Name = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        namespace Responses {
            export type $200 = Components.Responses.DeleteDataSourceByNameResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteDataSourceByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteFolder {
        namespace Parameters {
            export type FolderUid = string;
            export type ForceDeleteRules = boolean;
        }
        export interface PathParameters {
            folder_uid: Parameters.FolderUid;
        }
        export interface QueryParameters {
            forceDeleteRules?: Parameters.ForceDeleteRules;
        }
        namespace Responses {
            export type $200 = Components.Responses.DeleteFolderResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteGroupMappings {
        namespace Parameters {
            export type GroupId = string;
        }
        export interface PathParameters {
            group_id: Parameters.GroupId;
        }
        namespace Responses {
            export type $204 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteLibraryElementByUID {
        namespace Parameters {
            export type LibraryElementUid = string;
        }
        export interface PathParameters {
            library_element_uid: Parameters.LibraryElementUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteLicenseToken {
        export type RequestBody = Components.Schemas.DeleteTokenCommand;
        namespace Responses {
            export type $202 = Components.Responses.AcceptedResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $422 = Components.Responses.UnprocessableEntityError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteOrgByID {
        namespace Parameters {
            export type OrgId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeletePlaylist {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeletePublicDashboard {
        namespace Parameters {
            export type DashboardUid = string;
            export type Uid = string;
        }
        export interface PathParameters {
            dashboardUid: Parameters.DashboardUid;
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestPublicError;
            export type $401 = Components.Responses.UnauthorisedPublicError;
            export type $403 = Components.Responses.ForbiddenPublicError;
            export type $500 = Components.Responses.InternalServerPublicError;
        }
    }
    namespace DeleteQuery {
        namespace Parameters {
            export type QueryHistoryUid = string;
        }
        export interface PathParameters {
            query_history_uid: Parameters.QueryHistoryUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetQueryHistoryDeleteQueryResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteRecordingRule {
        namespace Parameters {
            export type RecordingRuleID = number; // int64
        }
        export interface PathParameters {
            recordingRuleID: Parameters.RecordingRuleID /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteRecordingRuleWriteTarget {
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteReport {
        namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteRole {
        namespace Parameters {
            export type Force = boolean;
            export type Global = boolean;
            export type RoleUID = string;
        }
        export interface PathParameters {
            roleUID: Parameters.RoleUID;
        }
        export interface QueryParameters {
            force?: Parameters.Force;
            global?: Parameters.Global;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteServiceAccount {
        namespace Parameters {
            export type ServiceAccountId = number; // int64
        }
        export interface PathParameters {
            serviceAccountId: Parameters.ServiceAccountId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteSession {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteTeamByID {
        namespace Parameters {
            export type TeamId = string;
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DeleteToken {
        namespace Parameters {
            export type ServiceAccountId = number; // int64
            export type TokenId = number; // int64
        }
        export interface PathParameters {
            tokenId: Parameters.TokenId /* int64 */;
            serviceAccountId: Parameters.ServiceAccountId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace DisableDataSourceCache {
        namespace Parameters {
            export type DataSourceUID = string;
        }
        export interface PathParameters {
            dataSourceUID: Parameters.DataSourceUID;
        }
        namespace Responses {
            export type $200 = Components.Schemas.CacheConfigResponse;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace EnableDataSourceCache {
        namespace Parameters {
            export type DataSourceUID = string;
        }
        export interface PathParameters {
            dataSourceUID: Parameters.DataSourceUID;
        }
        namespace Responses {
            export type $200 = Components.Schemas.CacheConfigResponse;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetAPIkeys {
        namespace Parameters {
            export type IncludeExpired = boolean;
        }
        export interface QueryParameters {
            includeExpired?: Parameters.IncludeExpired;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetAPIkeyResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetAccessControlStatus {
        namespace Responses {
            export type $200 = Components.Responses.GetAccessControlStatusResponse;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetAnnotationByID {
        namespace Parameters {
            export type AnnotationId = string;
        }
        export interface PathParameters {
            annotation_id: Parameters.AnnotationId;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetAnnotationByIDResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetAnnotationTags {
        namespace Parameters {
            export type Limit = string;
            export type Tag = string;
        }
        export interface QueryParameters {
            tag?: Parameters.Tag;
            limit?: Parameters.Limit;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetAnnotationTagsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetAnnotations {
        namespace Parameters {
            export type AlertId = number; // int64
            export type AlertUID = string;
            export type DashboardId = number; // int64
            export type DashboardUID = string;
            export type From = number; // int64
            export type Limit = number; // int64
            export type MatchAny = boolean;
            export type PanelId = number; // int64
            export type Tags = string[];
            export type To = number; // int64
            export type Type = "alert" | "annotation";
            export type UserId = number; // int64
        }
        export interface QueryParameters {
            from?: Parameters.From /* int64 */;
            to?: Parameters.To /* int64 */;
            userId?: Parameters.UserId /* int64 */;
            alertId?: Parameters.AlertId /* int64 */;
            alertUID?: Parameters.AlertUID;
            dashboardId?: Parameters.DashboardId /* int64 */;
            dashboardUID?: Parameters.DashboardUID;
            panelId?: Parameters.PanelId /* int64 */;
            limit?: Parameters.Limit /* int64 */;
            tags?: Parameters.Tags;
            type?: Parameters.Type;
            matchAny?: Parameters.MatchAny;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetAnnotationsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetCloudMigrationToken {
        namespace Responses {
            export type $200 = Components.Responses.CloudMigrationGetTokenResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetCorrelation {
        namespace Parameters {
            export type CorrelationUID = string;
            export type SourceUID = string;
        }
        export interface PathParameters {
            sourceUID: Parameters.SourceUID;
            correlationUID: Parameters.CorrelationUID;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetCorrelationResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetCorrelations {
        namespace Parameters {
            export type Limit = number; // int64
            export type Page = number; // int64
            export type SourceUID = string[];
        }
        export interface QueryParameters {
            limit?: Parameters.Limit /* int64 */;
            page?: Parameters.Page /* int64 */;
            sourceUID?: Parameters.SourceUID;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetCorrelationsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetCorrelationsBySourceUID {
        namespace Parameters {
            export type SourceUID = string;
        }
        export interface PathParameters {
            sourceUID: Parameters.SourceUID;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetCorrelationsBySourceUIDResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetCurrentOrg {
        namespace Responses {
            export type $200 = Components.Responses.GetCurrentOrgResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetCurrentOrgQuota {
        namespace Responses {
            export type $200 = Components.Responses.GetQuotaResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetCustomPermissionsCSV {
        namespace Responses {
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetCustomPermissionsReport {
        namespace Responses {
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDashboardByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.DashboardResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $406 = Components.Responses.NotAcceptableError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDashboardPermissionsListByID {
        namespace Parameters {
            export type DashboardID = number; // int64
        }
        export interface PathParameters {
            DashboardID: Parameters.DashboardID /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetDashboardPermissionsListResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDashboardPermissionsListByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetDashboardPermissionsListResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDashboardSnapshot {
        namespace Parameters {
            export type Key = string;
        }
        export interface PathParameters {
            key: Parameters.Key;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetDashboardSnapshotResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDashboardTags {
        namespace Responses {
            export type $200 = Components.Responses.GetDashboardsTagsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDashboardVersionByID {
        namespace Parameters {
            export type DashboardID = number; // int64
            export type DashboardVersionID = number; // int64
        }
        export interface PathParameters {
            DashboardID: Parameters.DashboardID /* int64 */;
            DashboardVersionID: Parameters.DashboardVersionID /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.DashboardVersionResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDashboardVersionByUID {
        namespace Parameters {
            export type DashboardVersionID = number; // int64
            export type Uid = string;
        }
        export interface PathParameters {
            DashboardVersionID: Parameters.DashboardVersionID /* int64 */;
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.DashboardVersionResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDashboardVersionsByID {
        namespace Parameters {
            export type DashboardID = number; // int64
        }
        export interface PathParameters {
            DashboardID: Parameters.DashboardID /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.DashboardVersionsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDashboardVersionsByUID {
        namespace Parameters {
            export type Limit = number; // int64
            export type Start = number; // int64
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        export interface QueryParameters {
            limit?: Parameters.Limit /* int64 */;
            start?: Parameters.Start /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.DashboardVersionsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDataSourceByID {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetDataSourceResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDataSourceByName {
        namespace Parameters {
            export type Name = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetDataSourceResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDataSourceByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetDataSourceResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDataSourceCacheConfig {
        namespace Parameters {
            export type DataSourceUID = string;
        }
        export interface PathParameters {
            dataSourceUID: Parameters.DataSourceUID;
        }
        namespace Responses {
            export type $200 = Components.Schemas.CacheConfigResponse;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDataSourceIdByName {
        namespace Parameters {
            export type Name = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetDataSourceIDResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetDataSources {
        namespace Responses {
            export type $200 = Components.Responses.GetDataSourcesResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetFolderByID {
        namespace Parameters {
            export type FolderId = number; // int64
        }
        export interface PathParameters {
            folder_id: Parameters.FolderId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.FolderResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetFolderByUID {
        namespace Parameters {
            export type FolderUid = string;
        }
        export interface PathParameters {
            folder_uid: Parameters.FolderUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.FolderResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetFolderDescendantCounts {
        namespace Parameters {
            export type FolderUid = string;
        }
        export interface PathParameters {
            folder_uid: Parameters.FolderUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetFolderDescendantCountsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetFolderPermissionList {
        namespace Parameters {
            export type FolderUid = string;
        }
        export interface PathParameters {
            folder_uid: Parameters.FolderUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetFolderPermissionListResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetFolders {
        namespace Parameters {
            export type Limit = number; // int64
            export type Page = number; // int64
            export type ParentUid = string;
            export type Permission = "Edit" | "View";
        }
        export interface QueryParameters {
            limit?: Parameters.Limit /* int64 */;
            page?: Parameters.Page /* int64 */;
            parentUid?: Parameters.ParentUid;
            permission?: Parameters.Permission;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetFoldersResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetGroupRoles {
        namespace Parameters {
            export type GroupId = string;
        }
        export interface PathParameters {
            group_id: Parameters.GroupId;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetGroupRolesResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetHealth {
        namespace Responses {
            export type $200 = Components.Schemas.HealthResponse;
            export type $503 = Components.Responses.InternalServerError;
        }
    }
    namespace GetHomeDashboard {
        namespace Responses {
            export type $200 = Components.Responses.GetHomeDashboardResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetLDAPStatus {
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetLibraryElementByName {
        namespace Parameters {
            export type LibraryElementName = string;
        }
        export interface PathParameters {
            library_element_name: Parameters.LibraryElementName;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetLibraryElementArrayResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetLibraryElementByUID {
        namespace Parameters {
            export type LibraryElementUid = string;
        }
        export interface PathParameters {
            library_element_uid: Parameters.LibraryElementUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetLibraryElementResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetLibraryElementConnections {
        namespace Parameters {
            export type LibraryElementUid = string;
        }
        export interface PathParameters {
            library_element_uid: Parameters.LibraryElementUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetLibraryElementConnectionsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetLibraryElements {
        namespace Parameters {
            export type ExcludeUid = string;
            export type FolderFilter = string;
            export type Kind = 1 | 2; // int64
            export type Page = number; // int64
            export type PerPage = number; // int64
            export type SearchString = string;
            export type SortDirection = "alpha-asc" | "alpha-desc";
            export type TypeFilter = string;
        }
        export interface QueryParameters {
            searchString?: Parameters.SearchString;
            kind?: Parameters.Kind /* int64 */;
            sortDirection?: Parameters.SortDirection;
            typeFilter?: Parameters.TypeFilter;
            excludeUid?: Parameters.ExcludeUid;
            folderFilter?: Parameters.FolderFilter;
            perPage?: Parameters.PerPage /* int64 */;
            page?: Parameters.Page /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetLibraryElementsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetLicenseToken {
        namespace Responses {
            export type $200 = Components.Responses.GetLicenseTokenResponse;
        }
    }
    namespace GetMappedGroups {
        namespace Responses {
            export type $200 = Components.Responses.GetGroupsResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetMetadata {
        namespace Responses {
            export type $200 = Components.Responses.ContentResponse;
        }
    }
    namespace GetOrgByID {
        namespace Parameters {
            export type OrgId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetOrgByIDResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetOrgByName {
        namespace Parameters {
            export type OrgName = string;
        }
        export interface PathParameters {
            org_name: Parameters.OrgName;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetOrgByNameResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetOrgPreferences {
        namespace Responses {
            export type $200 = Components.Responses.GetPreferencesResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetOrgQuota {
        namespace Parameters {
            export type OrgId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetQuotaResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetOrgUsers {
        namespace Parameters {
            export type OrgId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetOrgUsersResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetOrgUsersForCurrentOrg {
        namespace Parameters {
            export type Limit = number; // int64
            export type Query = string;
        }
        export interface QueryParameters {
            query?: Parameters.Query;
            limit?: Parameters.Limit /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetOrgUsersForCurrentOrgResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetOrgUsersForCurrentOrgLookup {
        namespace Parameters {
            export type Limit = number; // int64
            export type Query = string;
        }
        export interface QueryParameters {
            query?: Parameters.Query;
            limit?: Parameters.Limit /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetOrgUsersForCurrentOrgLookupResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetPendingOrgInvites {
        namespace Responses {
            export type $200 = Components.Responses.GetPendingOrgInvitesResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetPlaylist {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetPlaylistResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetPlaylistItems {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetPlaylistItemsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetProviderSettings {
        namespace Parameters {
            export type Key = string;
        }
        export interface PathParameters {
            key: Parameters.Key;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetSSOSettingsResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
        }
    }
    namespace GetPublicAnnotations {
        namespace Parameters {
            export type AccessToken = string;
        }
        export interface PathParameters {
            accessToken: Parameters.AccessToken;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetPublicAnnotationsResponse;
            export type $400 = Components.Responses.BadRequestPublicError;
            export type $401 = Components.Responses.UnauthorisedPublicError;
            export type $403 = Components.Responses.ForbiddenPublicError;
            export type $404 = Components.Responses.NotFoundPublicError;
            export type $500 = Components.Responses.InternalServerPublicError;
        }
    }
    namespace GetPublicDashboard {
        namespace Parameters {
            export type DashboardUid = string;
        }
        export interface PathParameters {
            dashboardUid: Parameters.DashboardUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetPublicDashboardResponse;
            export type $400 = Components.Responses.BadRequestPublicError;
            export type $401 = Components.Responses.UnauthorisedPublicError;
            export type $403 = Components.Responses.ForbiddenPublicError;
            export type $404 = Components.Responses.NotFoundPublicError;
            export type $500 = Components.Responses.InternalServerPublicError;
        }
    }
    namespace GetRecordingRuleWriteTarget {
        namespace Responses {
            export type $200 = Components.Responses.RecordingRuleWriteTargetResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetReport {
        namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetReportResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetReportSettings {
        namespace Responses {
            export type $200 = Components.Responses.GetReportSettingsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetReports {
        namespace Responses {
            export type $200 = Components.Responses.GetReportsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetResourceDescription {
        namespace Parameters {
            export type Resource = string;
        }
        export interface PathParameters {
            resource: Parameters.Resource;
        }
        namespace Responses {
            export type $200 = Components.Responses.ResourcePermissionsDescription;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetResourcePermissions {
        namespace Parameters {
            export type Resource = string;
            export type ResourceID = string;
        }
        export interface PathParameters {
            resource: Parameters.Resource;
            resourceID: Parameters.ResourceID;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetResourcePermissionsResponse;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetRole {
        namespace Parameters {
            export type RoleUID = string;
        }
        export interface PathParameters {
            roleUID: Parameters.RoleUID;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetRoleResponse;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetRoleAssignments {
        namespace Parameters {
            export type RoleUID = string;
        }
        export interface PathParameters {
            roleUID: Parameters.RoleUID;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetRoleAssignmentsResponse;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetSAMLLogout {
        namespace Responses {
            export interface $302 {
            }
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetSLO {
        namespace Responses {
            export interface $302 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetSession {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.CloudMigrationSessionResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetSessionList {
        namespace Responses {
            export type $200 = Components.Responses.CloudMigrationSessionListResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetSettingsImage {
        namespace Responses {
            export type $200 = Components.Responses.ContentResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetShapshotList {
        namespace Parameters {
            export type Limit = number; // int64
            export type Page = number; // int64
            export type Sort = string;
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        export interface QueryParameters {
            page?: Parameters.Page /* int64 */;
            limit?: Parameters.Limit /* int64 */;
            sort?: Parameters.Sort;
        }
        namespace Responses {
            export type $200 = Components.Responses.SnapshotListResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetSharingOptions {
        namespace Responses {
            export type $200 = Components.Responses.GetSharingOptionsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
        }
    }
    namespace GetSignedInUser {
        namespace Responses {
            export type $200 = Components.Responses.UserResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetSignedInUserOrgList {
        namespace Responses {
            export type $200 = Components.Responses.GetSignedInUserOrgListResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetSignedInUserTeamList {
        namespace Responses {
            export type $200 = Components.Responses.GetSignedInUserTeamListResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetSnapshot {
        namespace Parameters {
            export type ResultLimit = number; // int64
            export type ResultPage = number; // int64
            export type SnapshotUid = string;
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
            snapshotUid: Parameters.SnapshotUid;
        }
        export interface QueryParameters {
            resultPage?: Parameters.ResultPage /* int64 */;
            resultLimit?: Parameters.ResultLimit /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetSnapshotResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetStatus {
        namespace Responses {
            export type $200 = Components.Responses.GetStatusResponse;
        }
    }
    namespace GetSyncStatus {
        namespace Responses {
            export type $200 = Components.Responses.GetSyncStatusResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetTeamByID {
        namespace Parameters {
            export type TeamId = string;
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetTeamByIDResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetTeamGroupsApi {
        namespace Parameters {
            export type TeamId = number; // int64
        }
        export interface PathParameters {
            teamId: Parameters.TeamId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetTeamGroupsApiResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetTeamLBACRulesApi {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetTeamLBACRulesResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetTeamMembers {
        namespace Parameters {
            export type TeamId = string;
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetTeamMembersResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetTeamPreferences {
        namespace Parameters {
            export type TeamId = string;
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetPreferencesResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetUserAuthTokens {
        namespace Responses {
            export type $200 = Components.Responses.GetUserAuthTokensResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetUserByID {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.UserResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetUserByLoginOrEmail {
        namespace Parameters {
            export type LoginOrEmail = string;
        }
        export interface QueryParameters {
            loginOrEmail: Parameters.LoginOrEmail;
        }
        namespace Responses {
            export type $200 = Components.Responses.UserResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetUserFromLDAP {
        namespace Parameters {
            export type UserName = string;
        }
        export interface PathParameters {
            user_name: Parameters.UserName;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetUserOrgList {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetUserOrgListResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetUserPreferences {
        namespace Responses {
            export type $200 = Components.Responses.GetPreferencesResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetUserQuota {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetQuotaResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetUserQuotas {
        namespace Responses {
            export type $200 = Components.Responses.GetQuotaResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace GetUserTeams {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetUserTeamsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace HardDeleteDashboardByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        namespace Responses {
            export type $200 = Components.Responses.DeleteDashboardResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ImportDashboard {
        export type RequestBody = /* ImportDashboardRequest request object for importing a dashboard. */ Components.Schemas.ImportDashboardRequest;
        namespace Responses {
            export type $200 = Components.Responses.ImportDashboardResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $412 = Components.Responses.PreconditionFailedError;
            export type $422 = Components.Responses.UnprocessableEntityError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ListAllProvidersSettings {
        namespace Responses {
            export type $200 = Components.Responses.ListSSOSettingsResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
        }
    }
    namespace ListDevices {
        namespace Responses {
            export type $200 = Components.Responses.DevicesResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ListPublicDashboards {
        namespace Responses {
            export type $200 = Components.Responses.ListPublicDashboardsResponse;
            export type $401 = Components.Responses.UnauthorisedPublicError;
            export type $403 = Components.Responses.ForbiddenPublicError;
            export type $500 = Components.Responses.InternalServerPublicError;
        }
    }
    namespace ListRecordingRules {
        namespace Responses {
            export type $200 = Components.Responses.ListRecordingRulesResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ListRoles {
        namespace Parameters {
            export type Delegatable = boolean;
            export type IncludeHidden = boolean;
        }
        export interface QueryParameters {
            delegatable?: Parameters.Delegatable;
            includeHidden?: Parameters.IncludeHidden;
        }
        namespace Responses {
            export type $200 = Components.Responses.ListRolesResponse;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ListSortOptions {
        namespace Responses {
            export type $200 = Components.Responses.ListSortOptionsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
        }
    }
    namespace ListTeamRoles {
        namespace Parameters {
            export type TeamId = number; // int64
        }
        export interface PathParameters {
            teamId: Parameters.TeamId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ListTeamsRoles {
        export type RequestBody = Components.Schemas.RolesSearchQuery;
        namespace Responses {
            export type $200 = Components.Responses.ListTeamsRolesResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ListTokens {
        namespace Parameters {
            export type ServiceAccountId = number; // int64
        }
        export interface PathParameters {
            serviceAccountId: Parameters.ServiceAccountId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.ListTokensResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ListUserRoles {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            userId: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetAllRolesResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ListUsersRoles {
        export type RequestBody = Components.Schemas.RolesSearchQuery;
        namespace Responses {
            export type $200 = Components.Responses.ListUsersRolesResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace MassDeleteAnnotations {
        export type RequestBody = Components.Schemas.MassDeleteAnnotationsCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace MoveFolder {
        namespace Parameters {
            export type FolderUid = string;
        }
        export interface PathParameters {
            folder_uid: Parameters.FolderUid;
        }
        export type RequestBody = /**
         * MoveFolderCommand captures the information required by the folder service
         * to move a folder.
         */
        Components.Schemas.MoveFolderCommand;
        namespace Responses {
            export type $200 = Components.Responses.FolderResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PatchAnnotation {
        namespace Parameters {
            export type AnnotationId = string;
        }
        export interface PathParameters {
            annotation_id: Parameters.AnnotationId;
        }
        export type RequestBody = Components.Schemas.PatchAnnotationsCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PatchOrgPreferences {
        export type RequestBody = Components.Schemas.PatchPrefsCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PatchQueryComment {
        namespace Parameters {
            export type QueryHistoryUid = string;
        }
        export interface PathParameters {
            query_history_uid: Parameters.QueryHistoryUid;
        }
        export type RequestBody = /* PatchQueryCommentInQueryHistoryCommand is the command for updating comment for query in query history */ Components.Schemas.PatchQueryCommentInQueryHistoryCommand;
        namespace Responses {
            export type $200 = Components.Responses.GetQueryHistoryResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PatchUserPreferences {
        export type RequestBody = Components.Schemas.PatchPrefsCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PostACS {
        namespace Parameters {
            export type RelayState = string;
        }
        export interface QueryParameters {
            RelayState?: Parameters.RelayState;
        }
        namespace Responses {
            export interface $302 {
            }
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PostAnnotation {
        export type RequestBody = Components.Schemas.PostAnnotationsCmd;
        namespace Responses {
            export type $200 = Components.Responses.PostAnnotationResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PostDashboard {
        export type RequestBody = Components.Schemas.SaveDashboardCommand;
        namespace Responses {
            export type $200 = Components.Responses.PostDashboardResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $412 = Components.Responses.PreconditionFailedError;
            export type $422 = Components.Responses.UnprocessableEntityError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PostGraphiteAnnotation {
        export type RequestBody = Components.Schemas.PostGraphiteAnnotationsCmd;
        namespace Responses {
            export type $200 = Components.Responses.PostAnnotationResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PostLicenseToken {
        export type RequestBody = Components.Schemas.DeleteTokenCommand;
        namespace Responses {
            export type $200 = Components.Responses.GetLicenseTokenResponse;
            export type $400 = Components.Responses.BadRequestError;
        }
    }
    namespace PostRenewLicenseToken {
        export interface RequestBody {
        }
        namespace Responses {
            export type $200 = Components.Responses.PostRenewLicenseTokenResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $404 = Components.Responses.NotFoundError;
        }
    }
    namespace PostSLO {
        namespace Parameters {
            export type SAMLRequest = string;
            export type SAMLResponse = string;
        }
        export interface QueryParameters {
            SAMLRequest?: Parameters.SAMLRequest;
            SAMLResponse?: Parameters.SAMLResponse;
        }
        namespace Responses {
            export interface $302 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace PostSyncUserWithLDAP {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace QueryMetricsWithExpressions {
        export type RequestBody = Components.Schemas.MetricRequest;
        namespace Responses {
            export type $200 = Components.Responses.QueryMetricsWithExpressionsRespons;
            export type $207 = Components.Responses.QueryMetricsWithExpressionsRespons;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace QueryPublicDashboard {
        namespace Parameters {
            export type AccessToken = string;
            export type PanelId = number; // int64
        }
        export interface PathParameters {
            accessToken: Parameters.AccessToken;
            panelId: Parameters.PanelId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.QueryPublicDashboardResponse;
            export type $400 = Components.Responses.BadRequestPublicError;
            export type $401 = Components.Responses.UnauthorisedPublicError;
            export type $403 = Components.Responses.ForbiddenPublicError;
            export type $404 = Components.Responses.NotFoundPublicError;
            export type $500 = Components.Responses.InternalServerPublicError;
        }
    }
    namespace RefreshLicenseStats {
        namespace Responses {
            export type $200 = Components.Responses.RefreshLicenseStatsResponse;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ReloadLDAPCfg {
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RemoveOrgUser {
        namespace Parameters {
            export type OrgId = number; // int64
            export type UserId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RemoveOrgUserForCurrentOrg {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RemoveProviderSettings {
        namespace Parameters {
            export type Key = string;
        }
        export interface PathParameters {
            key: Parameters.Key;
        }
        namespace Responses {
            export type $204 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RemoveTeamGroupApiQuery {
        namespace Parameters {
            export type GroupId = string;
            export type TeamId = number; // int64
        }
        export interface PathParameters {
            teamId: Parameters.TeamId /* int64 */;
        }
        export interface QueryParameters {
            groupId?: Parameters.GroupId;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RemoveTeamMember {
        namespace Parameters {
            export type TeamId = string;
            export type UserId = number; // int64
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
            user_id: Parameters.UserId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RemoveTeamRole {
        namespace Parameters {
            export type RoleUID = string;
            export type TeamId = number; // int64
        }
        export interface PathParameters {
            roleUID: Parameters.RoleUID;
            teamId: Parameters.TeamId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RemoveUserRole {
        namespace Parameters {
            export type Global = boolean;
            export type RoleUID = string;
            export type UserId = number; // int64
        }
        export interface PathParameters {
            roleUID: Parameters.RoleUID;
            userId: Parameters.UserId /* int64 */;
        }
        export interface QueryParameters {
            global?: Parameters.Global;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RenderReportCSVs {
        namespace Parameters {
            export type Dashboards = string;
            export type Title = string;
        }
        export interface QueryParameters {
            dashboards?: Parameters.Dashboards;
            title?: Parameters.Title;
        }
        namespace Responses {
            export type $200 = Components.Responses.ContentResponse;
            export type $204 = Components.Responses.NoContentResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RenderReportPDFs {
        namespace Parameters {
            export type Dashboards = string;
            export type IncludeTables = string;
            export type Layout = string;
            export type Orientation = string;
            export type ScaleFactor = string;
            export type Title = string;
        }
        export interface QueryParameters {
            dashboards?: Parameters.Dashboards;
            orientation?: Parameters.Orientation;
            layout?: Parameters.Layout;
            title?: Parameters.Title;
            scaleFactor?: Parameters.ScaleFactor;
            includeTables?: Parameters.IncludeTables;
        }
        namespace Responses {
            export type $200 = Components.Responses.ContentResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RestoreDashboardVersionByID {
        namespace Parameters {
            export type DashboardID = number; // int64
        }
        export interface PathParameters {
            DashboardID: Parameters.DashboardID /* int64 */;
        }
        export type RequestBody = Components.Schemas.RestoreDashboardVersionCommand;
        namespace Responses {
            export type $200 = Components.Responses.PostDashboardResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RestoreDashboardVersionByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        export type RequestBody = Components.Schemas.RestoreDashboardVersionCommand;
        namespace Responses {
            export type $200 = Components.Responses.PostDashboardResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RestoreDeletedDashboardByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        export type RequestBody = Components.Schemas.RestoreDeletedDashboardCommand;
        namespace Responses {
            export type $200 = Components.Responses.PostDashboardResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RetrieveJWKS {
        namespace Responses {
            export type $200 = Components.Responses.JwksResponse;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RetrieveServiceAccount {
        namespace Parameters {
            export type ServiceAccountId = number; // int64
        }
        export interface PathParameters {
            serviceAccountId: Parameters.ServiceAccountId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.RetrieveServiceAccountResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RevokeInvite {
        namespace Parameters {
            export type InvitationCode = string;
        }
        export interface PathParameters {
            invitation_code: Parameters.InvitationCode;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RevokeUserAuthToken {
        export type RequestBody = Components.Schemas.RevokeAuthTokenCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace RouteDeleteAlertRule {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type UID = string;
            export type XDisableProvenance = string;
        }
        export interface PathParameters {
            UID: Parameters.UID;
        }
        namespace Responses {
            export interface $204 {
            }
        }
    }
    namespace RouteDeleteAlertRuleGroup {
        namespace Parameters {
            export type FolderUID = string;
            export type Group = string;
        }
        export interface PathParameters {
            FolderUID: Parameters.FolderUID;
            Group: Parameters.Group;
        }
        namespace Responses {
            export interface $204 {
            }
            export type $403 = Components.Schemas.ForbiddenError;
            export type $404 = Components.Schemas.NotFound;
        }
    }
    namespace RouteDeleteContactpoints {
        namespace Parameters {
            export type UID = string;
        }
        export interface PathParameters {
            UID: Parameters.UID;
        }
        namespace Responses {
            export interface $202 {
            }
        }
    }
    namespace RouteDeleteMuteTiming {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type Name = string;
            export type Version = string;
            export type XDisableProvenance = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        export interface QueryParameters {
            version?: Parameters.Version;
        }
        namespace Responses {
            export interface $204 {
            }
            export type $409 = /**
             * PublicError is derived from Error and only contains information
             * available to the end user.
             */
            Components.Schemas.PublicError;
        }
    }
    namespace RouteDeleteTemplate {
        namespace Parameters {
            export type Name = string;
            export type Version = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        export interface QueryParameters {
            version?: Parameters.Version;
        }
        namespace Responses {
            export interface $204 {
            }
            export type $409 = /**
             * PublicError is derived from Error and only contains information
             * available to the end user.
             */
            Components.Schemas.PublicError;
        }
    }
    namespace RouteExportMuteTiming {
        namespace Parameters {
            export type Download = boolean;
            export type Format = "yaml" | "json" | "hcl";
            export type Name = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        export interface QueryParameters {
            download?: Parameters.Download;
            format?: Parameters.Format;
        }
        namespace Responses {
            export type $200 = /* AlertingFileExport is the full provisioned file export. */ Components.Schemas.AlertingFileExport;
            export type $403 = Components.Schemas.PermissionDenied;
        }
    }
    namespace RouteExportMuteTimings {
        namespace Parameters {
            export type Download = boolean;
            export type Format = "yaml" | "json" | "hcl";
        }
        export interface QueryParameters {
            download?: Parameters.Download;
            format?: Parameters.Format;
        }
        namespace Responses {
            export type $200 = /* AlertingFileExport is the full provisioned file export. */ Components.Schemas.AlertingFileExport;
            export type $403 = Components.Schemas.PermissionDenied;
        }
    }
    namespace RouteGetAlertRule {
        namespace Parameters {
            export type UID = string;
        }
        export interface PathParameters {
            UID: Parameters.UID;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ProvisionedAlertRule;
            export interface $404 {
            }
        }
    }
    namespace RouteGetAlertRuleExport {
        namespace Parameters {
            export type Download = boolean;
            export type Format = "yaml" | "json" | "hcl";
            export type UID = string;
        }
        export interface PathParameters {
            UID: Parameters.UID;
        }
        export interface QueryParameters {
            download?: Parameters.Download;
            format?: Parameters.Format;
        }
        namespace Responses {
            export type $200 = /* AlertingFileExport is the full provisioned file export. */ Components.Schemas.AlertingFileExport;
            export interface $404 {
            }
        }
    }
    namespace RouteGetAlertRuleGroup {
        namespace Parameters {
            export type FolderUID = string;
            export type Group = string;
        }
        export interface PathParameters {
            FolderUID: Parameters.FolderUID;
            Group: Parameters.Group;
        }
        namespace Responses {
            export type $200 = Components.Schemas.AlertRuleGroup;
            export interface $404 {
            }
        }
    }
    namespace RouteGetAlertRuleGroupExport {
        namespace Parameters {
            export type Download = boolean;
            export type FolderUID = string;
            export type Format = "yaml" | "json" | "hcl";
            export type Group = string;
        }
        export interface PathParameters {
            FolderUID: Parameters.FolderUID;
            Group: Parameters.Group;
        }
        export interface QueryParameters {
            download?: Parameters.Download;
            format?: Parameters.Format;
        }
        namespace Responses {
            export type $200 = /* AlertingFileExport is the full provisioned file export. */ Components.Schemas.AlertingFileExport;
            export interface $404 {
            }
        }
    }
    namespace RouteGetAlertRules {
        namespace Responses {
            export type $200 = Components.Schemas.ProvisionedAlertRules;
        }
    }
    namespace RouteGetAlertRulesExport {
        namespace Parameters {
            export type Download = boolean;
            export type FolderUid = string[];
            export type Format = "yaml" | "json" | "hcl";
            export type Group = string;
            export type RuleUid = string;
        }
        export interface QueryParameters {
            download?: Parameters.Download;
            format?: Parameters.Format;
            folderUid?: Parameters.FolderUid;
            group?: Parameters.Group;
            ruleUid?: Parameters.RuleUid;
        }
        namespace Responses {
            export type $200 = /* AlertingFileExport is the full provisioned file export. */ Components.Schemas.AlertingFileExport;
            export interface $404 {
            }
        }
    }
    namespace RouteGetContactpoints {
        namespace Parameters {
            export type Name = string;
        }
        export interface QueryParameters {
            name?: Parameters.Name;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ContactPoints;
        }
    }
    namespace RouteGetContactpointsExport {
        namespace Parameters {
            export type Decrypt = boolean;
            export type Download = boolean;
            export type Format = "yaml" | "json" | "hcl";
            export type Name = string;
        }
        export interface QueryParameters {
            download?: Parameters.Download;
            format?: Parameters.Format;
            decrypt?: Parameters.Decrypt;
            name?: Parameters.Name;
        }
        namespace Responses {
            export type $200 = /* AlertingFileExport is the full provisioned file export. */ Components.Schemas.AlertingFileExport;
            export type $403 = Components.Schemas.PermissionDenied;
        }
    }
    namespace RouteGetMuteTiming {
        namespace Parameters {
            export type Name = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        namespace Responses {
            export type $200 = /* MuteTimeInterval represents a named set of time intervals for which a route should be muted. */ Components.Schemas.MuteTimeInterval;
            export interface $404 {
            }
        }
    }
    namespace RouteGetMuteTimings {
        namespace Responses {
            export type $200 = Components.Schemas.MuteTimings;
        }
    }
    namespace RouteGetPolicyTree {
        namespace Responses {
            export type $200 = /**
             * A Route is a node that contains definitions of how to handle alerts. This is modified
             * from the upstream alertmanager in that it adds the ObjectMatchers property.
             */
            Components.Schemas.Route;
        }
    }
    namespace RouteGetPolicyTreeExport {
        namespace Responses {
            export type $200 = /* AlertingFileExport is the full provisioned file export. */ Components.Schemas.AlertingFileExport;
            export type $404 = Components.Schemas.NotFound;
        }
    }
    namespace RouteGetTemplate {
        namespace Parameters {
            export type Name = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        namespace Responses {
            export type $200 = Components.Schemas.NotificationTemplate;
            export type $404 = /**
             * PublicError is derived from Error and only contains information
             * available to the end user.
             */
            Components.Schemas.PublicError;
        }
    }
    namespace RouteGetTemplates {
        namespace Responses {
            export type $200 = Components.Schemas.NotificationTemplates;
        }
    }
    namespace RoutePostAlertRule {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type XDisableProvenance = string;
        }
        export type RequestBody = Components.Schemas.ProvisionedAlertRule;
        namespace Responses {
            export type $201 = Components.Schemas.ProvisionedAlertRule;
            export type $400 = Components.Schemas.ValidationError;
        }
    }
    namespace RoutePostContactpoints {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type XDisableProvenance = string;
        }
        export type RequestBody = /**
         * EmbeddedContactPoint is the contact point type that is used
         * by grafanas embedded alertmanager implementation.
         */
        Components.Schemas.EmbeddedContactPoint;
        namespace Responses {
            export type $202 = /**
             * EmbeddedContactPoint is the contact point type that is used
             * by grafanas embedded alertmanager implementation.
             */
            Components.Schemas.EmbeddedContactPoint;
            export type $400 = Components.Schemas.ValidationError;
        }
    }
    namespace RoutePostMuteTiming {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type XDisableProvenance = string;
        }
        export type RequestBody = /* MuteTimeInterval represents a named set of time intervals for which a route should be muted. */ Components.Schemas.MuteTimeInterval;
        namespace Responses {
            export type $201 = /* MuteTimeInterval represents a named set of time intervals for which a route should be muted. */ Components.Schemas.MuteTimeInterval;
            export type $400 = Components.Schemas.ValidationError;
        }
    }
    namespace RoutePutAlertRule {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type UID = string;
            export type XDisableProvenance = string;
        }
        export interface PathParameters {
            UID: Parameters.UID;
        }
        export type RequestBody = Components.Schemas.ProvisionedAlertRule;
        namespace Responses {
            export type $200 = Components.Schemas.ProvisionedAlertRule;
            export type $400 = Components.Schemas.ValidationError;
        }
    }
    namespace RoutePutAlertRuleGroup {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type FolderUID = string;
            export type Group = string;
            export type XDisableProvenance = string;
        }
        export interface PathParameters {
            FolderUID: Parameters.FolderUID;
            Group: Parameters.Group;
        }
        export type RequestBody = Components.Schemas.AlertRuleGroup;
        namespace Responses {
            export type $200 = Components.Schemas.AlertRuleGroup;
            export type $400 = Components.Schemas.ValidationError;
        }
    }
    namespace RoutePutContactpoint {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type UID = string;
            export type XDisableProvenance = string;
        }
        export interface PathParameters {
            UID: Parameters.UID;
        }
        export type RequestBody = /**
         * EmbeddedContactPoint is the contact point type that is used
         * by grafanas embedded alertmanager implementation.
         */
        Components.Schemas.EmbeddedContactPoint;
        namespace Responses {
            export type $202 = Components.Schemas.Ack;
            export type $400 = Components.Schemas.ValidationError;
        }
    }
    namespace RoutePutMuteTiming {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type Name = string;
            export type XDisableProvenance = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        export type RequestBody = /* MuteTimeInterval represents a named set of time intervals for which a route should be muted. */ Components.Schemas.MuteTimeInterval;
        namespace Responses {
            export type $202 = /* MuteTimeInterval represents a named set of time intervals for which a route should be muted. */ Components.Schemas.MuteTimeInterval;
            export type $400 = Components.Schemas.ValidationError;
            export type $409 = /**
             * PublicError is derived from Error and only contains information
             * available to the end user.
             */
            Components.Schemas.PublicError;
        }
    }
    namespace RoutePutPolicyTree {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type XDisableProvenance = string;
        }
        export type RequestBody = /**
         * A Route is a node that contains definitions of how to handle alerts. This is modified
         * from the upstream alertmanager in that it adds the ObjectMatchers property.
         */
        Components.Schemas.Route;
        namespace Responses {
            export type $202 = Components.Schemas.Ack;
            export type $400 = Components.Schemas.ValidationError;
        }
    }
    namespace RoutePutTemplate {
        export interface HeaderParameters {
            "X-Disable-Provenance"?: Parameters.XDisableProvenance;
        }
        namespace Parameters {
            export type Name = string;
            export type XDisableProvenance = string;
        }
        export interface PathParameters {
            name: Parameters.Name;
        }
        export type RequestBody = Components.Schemas.NotificationTemplateContent;
        namespace Responses {
            export type $202 = Components.Schemas.NotificationTemplate;
            export type $400 = /**
             * PublicError is derived from Error and only contains information
             * available to the end user.
             */
            Components.Schemas.PublicError;
            export type $409 = /**
             * PublicError is derived from Error and only contains information
             * available to the end user.
             */
            Components.Schemas.PublicError;
        }
    }
    namespace RouteResetPolicyTree {
        namespace Responses {
            export type $202 = Components.Schemas.Ack;
        }
    }
    namespace SaveReportSettings {
        export type RequestBody = Components.Schemas.ReportSettings;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace Search {
        namespace Parameters {
            export type DashboardIds = number /* int64 */[];
            export type DashboardUIDs = string[];
            export type Deleted = boolean;
            export type FolderIds = number /* int64 */[];
            export type FolderUIDs = string[];
            export type Limit = number; // int64
            export type Page = number; // int64
            export type Permission = "Edit" | "View";
            export type Query = string;
            export type Sort = "alpha-asc" | "alpha-desc";
            export type Starred = boolean;
            export type Tag = string[];
            export type Type = "dash-folder" | "dash-db";
        }
        export interface QueryParameters {
            query?: Parameters.Query;
            tag?: Parameters.Tag;
            type?: Parameters.Type;
            dashboardIds?: Parameters.DashboardIds;
            dashboardUIDs?: Parameters.DashboardUIDs;
            folderIds?: Parameters.FolderIds;
            folderUIDs?: Parameters.FolderUIDs;
            starred?: Parameters.Starred;
            limit?: Parameters.Limit /* int64 */;
            page?: Parameters.Page /* int64 */;
            permission?: Parameters.Permission;
            sort?: Parameters.Sort;
            deleted?: Parameters.Deleted;
        }
        namespace Responses {
            export type $200 = Components.Responses.SearchResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $422 = Components.Responses.UnprocessableEntityError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchDashboardSnapshots {
        namespace Parameters {
            export type Limit = number; // int64
            export type Query = string;
        }
        export interface QueryParameters {
            query?: Parameters.Query;
            limit?: Parameters.Limit /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.SearchDashboardSnapshotsResponse;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchDevices {
        namespace Responses {
            export type $200 = Components.Responses.DevicesSearchResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchOrgServiceAccountsWithPaging {
        namespace Parameters {
            export type Disabled = boolean;
            export type ExpiredTokens = boolean;
            export type Page = number; // int64
            export type Perpage = number; // int64
            export type Query = string;
        }
        export interface QueryParameters {
            Disabled?: Parameters.Disabled;
            expiredTokens?: Parameters.ExpiredTokens;
            query?: Parameters.Query;
            perpage?: Parameters.Perpage /* int64 */;
            page?: Parameters.Page /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.SearchOrgServiceAccountsWithPagingResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchOrgUsers {
        namespace Parameters {
            export type OrgId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.SearchOrgUsersResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchOrgs {
        namespace Parameters {
            export type Name = string;
            export type Page = number; // int64
            export type Perpage = number; // int64
            export type Query = string;
        }
        export interface QueryParameters {
            page?: Parameters.Page /* int64 */;
            perpage?: Parameters.Perpage /* int64 */;
            name?: Parameters.Name;
            query?: Parameters.Query;
        }
        namespace Responses {
            export type $200 = Components.Responses.SearchOrgsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchPlaylists {
        namespace Parameters {
            export type Limit = number; // int64
            export type Query = string;
        }
        export interface QueryParameters {
            query?: Parameters.Query;
            limit?: Parameters.Limit /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.SearchPlaylistsResponse;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchQueries {
        namespace Parameters {
            export type DatasourceUid = string[];
            export type From = number; // int64
            export type Limit = number; // int64
            export type OnlyStarred = boolean;
            export type Page = number; // int64
            export type SearchString = string;
            export type Sort = "time-desc" | "time-asc";
            export type To = number; // int64
        }
        export interface QueryParameters {
            datasourceUid?: Parameters.DatasourceUid;
            searchString?: Parameters.SearchString;
            onlyStarred?: Parameters.OnlyStarred;
            sort?: Parameters.Sort;
            page?: Parameters.Page /* int64 */;
            limit?: Parameters.Limit /* int64 */;
            from?: Parameters.From /* int64 */;
            to?: Parameters.To /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetQueryHistorySearchResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchResult {
        namespace Responses {
            export type $200 = Components.Responses.SearchResultResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchTeams {
        namespace Parameters {
            export type Name = string;
            export type Page = number; // int64
            export type Perpage = number; // int64
            export type Query = string;
        }
        export interface QueryParameters {
            page?: Parameters.Page /* int64 */;
            perpage?: Parameters.Perpage /* int64 */;
            name?: Parameters.Name;
            query?: Parameters.Query;
        }
        namespace Responses {
            export type $200 = Components.Responses.SearchTeamsResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchUsers {
        namespace Parameters {
            export type Page = number; // int64
            export type Perpage = number; // int64
        }
        export interface QueryParameters {
            perpage?: Parameters.Perpage /* int64 */;
            page?: Parameters.Page /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.SearchUsersResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SearchUsersWithPaging {
        namespace Responses {
            export type $200 = Components.Responses.SearchUsersWithPagingResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SendReport {
        export type RequestBody = Components.Schemas.ReportEmail;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SendTestEmail {
        export type RequestBody = Components.Schemas.CreateOrUpdateReport;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetDataSourceCacheConfig {
        namespace Parameters {
            export type DataSourceUID = string;
        }
        export interface PathParameters {
            dataSourceUID: Parameters.DataSourceUID;
        }
        export type RequestBody = /**
         * ConfigSetter defines the cache parameters that users can configure per datasource
         * This is only intended to be consumed by the SetCache HTTP Handler
         */
        Components.Schemas.CacheConfigSetter;
        namespace Responses {
            export type $200 = Components.Schemas.CacheConfigResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetHelpFlag {
        namespace Parameters {
            export type FlagId = string;
        }
        export interface PathParameters {
            flag_id: Parameters.FlagId;
        }
        namespace Responses {
            export type $200 = Components.Responses.HelpFlagResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetResourcePermissions {
        namespace Parameters {
            export type Resource = string;
            export type ResourceID = string;
        }
        export interface PathParameters {
            resource: Parameters.Resource;
            resourceID: Parameters.ResourceID;
        }
        export type RequestBody = Components.Schemas.SetPermissionsCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetResourcePermissionsForBuiltInRole {
        namespace Parameters {
            export type BuiltInRole = string;
            export type Resource = string;
            export type ResourceID = string;
        }
        export interface PathParameters {
            resource: Parameters.Resource;
            resourceID: Parameters.ResourceID;
            builtInRole: Parameters.BuiltInRole;
        }
        export type RequestBody = Components.Schemas.SetPermissionCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetResourcePermissionsForTeam {
        namespace Parameters {
            export type Resource = string;
            export type ResourceID = string;
            export type TeamID = number; // int64
        }
        export interface PathParameters {
            resource: Parameters.Resource;
            resourceID: Parameters.ResourceID;
            teamID: Parameters.TeamID /* int64 */;
        }
        export type RequestBody = Components.Schemas.SetPermissionCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetResourcePermissionsForUser {
        namespace Parameters {
            export type Resource = string;
            export type ResourceID = string;
            export type UserID = number; // int64
        }
        export interface PathParameters {
            resource: Parameters.Resource;
            resourceID: Parameters.ResourceID;
            userID: Parameters.UserID /* int64 */;
        }
        export type RequestBody = Components.Schemas.SetPermissionCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetRoleAssignments {
        namespace Parameters {
            export type RoleUID = string;
        }
        export interface PathParameters {
            roleUID: Parameters.RoleUID;
        }
        export type RequestBody = Components.Schemas.SetRoleAssignmentsCommand;
        namespace Responses {
            export type $200 = Components.Responses.SetRoleAssignmentsResponse;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetTeamMemberships {
        namespace Parameters {
            export type TeamId = string;
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
        }
        export type RequestBody = Components.Schemas.SetTeamMembershipsCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetTeamRoles {
        namespace Parameters {
            export type TeamId = number; // int64
        }
        export interface PathParameters {
            teamId: Parameters.TeamId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace SetUserRoles {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            userId: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.SetUserRolesCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace StarDashboard {
        namespace Parameters {
            export type DashboardId = string;
        }
        export interface PathParameters {
            dashboard_id: Parameters.DashboardId;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace StarDashboardByUID {
        namespace Parameters {
            export type DashboardUid = string;
        }
        export interface PathParameters {
            dashboard_uid: Parameters.DashboardUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace StarQuery {
        namespace Parameters {
            export type QueryHistoryUid = string;
        }
        export interface PathParameters {
            query_history_uid: Parameters.QueryHistoryUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetQueryHistoryResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace TestCreateRecordingRule {
        export type RequestBody = /* RecordingRuleJSON is the external representation of a recording rule */ Components.Schemas.RecordingRuleJSON;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $422 = Components.Responses.UnprocessableEntityError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UnstarDashboard {
        namespace Parameters {
            export type DashboardId = string;
        }
        export interface PathParameters {
            dashboard_id: Parameters.DashboardId;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UnstarDashboardByUID {
        namespace Parameters {
            export type DashboardUid = string;
        }
        export interface PathParameters {
            dashboard_uid: Parameters.DashboardUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UnstarQuery {
        namespace Parameters {
            export type QueryHistoryUid = string;
        }
        export interface PathParameters {
            query_history_uid: Parameters.QueryHistoryUid;
        }
        namespace Responses {
            export type $200 = Components.Responses.GetQueryHistoryResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateAnnotation {
        namespace Parameters {
            export type AnnotationId = string;
        }
        export interface PathParameters {
            annotation_id: Parameters.AnnotationId;
        }
        export type RequestBody = Components.Schemas.UpdateAnnotationsCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateCorrelation {
        namespace Parameters {
            export type CorrelationUID = string;
            export type SourceUID = string;
        }
        export interface PathParameters {
            sourceUID: Parameters.SourceUID;
            correlationUID: Parameters.CorrelationUID;
        }
        export type RequestBody = /* UpdateCorrelationCommand is the command for updating a correlation */ Components.Schemas.UpdateCorrelationCommand;
        namespace Responses {
            export type $200 = Components.Responses.UpdateCorrelationResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateCurrentOrg {
        export type RequestBody = Components.Schemas.UpdateOrgForm;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateCurrentOrgAddress {
        export type RequestBody = Components.Schemas.UpdateOrgAddressForm;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateDashboardPermissionsByID {
        namespace Parameters {
            export type DashboardID = number; // int64
        }
        export interface PathParameters {
            DashboardID: Parameters.DashboardID /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateDashboardACLCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateDashboardPermissionsByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        export type RequestBody = Components.Schemas.UpdateDashboardACLCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateDataSourceByID {
        namespace Parameters {
            export type Id = string;
        }
        export interface PathParameters {
            id: Parameters.Id;
        }
        export type RequestBody = /* Also acts as api DTO */ Components.Schemas.UpdateDataSourceCommand;
        namespace Responses {
            export type $200 = Components.Responses.CreateOrUpdateDatasourceResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateDataSourceByUID {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        export type RequestBody = /* Also acts as api DTO */ Components.Schemas.UpdateDataSourceCommand;
        namespace Responses {
            export type $200 = Components.Responses.CreateOrUpdateDatasourceResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateFolder {
        namespace Parameters {
            export type FolderUid = string;
        }
        export interface PathParameters {
            folder_uid: Parameters.FolderUid;
        }
        export type RequestBody = /**
         * UpdateFolderCommand captures the information required by the folder service
         * to update a folder. Use Move to update a folder's parent folder.
         */
        Components.Schemas.UpdateFolderCommand;
        namespace Responses {
            export type $200 = Components.Responses.FolderResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateFolderPermissions {
        namespace Parameters {
            export type FolderUid = string;
        }
        export interface PathParameters {
            folder_uid: Parameters.FolderUid;
        }
        export type RequestBody = Components.Schemas.UpdateDashboardACLCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateGroupMappings {
        namespace Parameters {
            export type GroupId = string;
        }
        export interface PathParameters {
            group_id: Parameters.GroupId;
        }
        export type RequestBody = Components.Schemas.GroupAttributes;
        namespace Responses {
            export type $201 = Components.Responses.ApiResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateLibraryElement {
        namespace Parameters {
            export type LibraryElementUid = string;
        }
        export interface PathParameters {
            library_element_uid: Parameters.LibraryElementUid;
        }
        export type RequestBody = /* PatchLibraryElementCommand is the command for patching a LibraryElement */ Components.Schemas.PatchLibraryElementCommand;
        namespace Responses {
            export type $200 = Components.Responses.GetLibraryElementResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $412 = Components.Responses.PreconditionFailedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateOrg {
        namespace Parameters {
            export type OrgId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateOrgForm;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateOrgAddress {
        namespace Parameters {
            export type OrgId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateOrgAddressForm;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateOrgPreferences {
        export type RequestBody = Components.Schemas.UpdatePrefsCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateOrgQuota {
        namespace Parameters {
            export type OrgId = number; // int64
            export type QuotaTarget = string;
        }
        export interface PathParameters {
            quota_target: Parameters.QuotaTarget;
            org_id: Parameters.OrgId /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateQuotaCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateOrgUser {
        namespace Parameters {
            export type OrgId = number; // int64
            export type UserId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
            user_id: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateOrgUserCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateOrgUserForCurrentOrg {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateOrgUserCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdatePlaylist {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        export type RequestBody = Components.Schemas.UpdatePlaylistCommand;
        namespace Responses {
            export type $200 = Components.Responses.UpdatePlaylistResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateProviderSettings {
        namespace Parameters {
            export type Key = string;
        }
        export interface PathParameters {
            key: Parameters.Key;
        }
        export interface RequestBody {
            id?: string;
            provider?: string;
            settings?: {
                [name: string]: any;
            };
        }
        namespace Responses {
            export type $204 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdatePublicDashboard {
        namespace Parameters {
            export type DashboardUid = string;
            export type Uid = string;
        }
        export interface PathParameters {
            dashboardUid: Parameters.DashboardUid;
            uid: Parameters.Uid;
        }
        export type RequestBody = Components.Schemas.PublicDashboardDTO;
        namespace Responses {
            export type $200 = Components.Responses.UpdatePublicDashboardResponse;
            export type $400 = Components.Responses.BadRequestPublicError;
            export type $401 = Components.Responses.UnauthorisedPublicError;
            export type $403 = Components.Responses.ForbiddenPublicError;
            export type $500 = Components.Responses.InternalServerPublicError;
        }
    }
    namespace UpdateRecordingRule {
        export type RequestBody = /* RecordingRuleJSON is the external representation of a recording rule */ Components.Schemas.RecordingRuleJSON;
        namespace Responses {
            export type $200 = Components.Responses.RecordingRuleResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateReport {
        namespace Parameters {
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id /* int64 */;
        }
        export type RequestBody = Components.Schemas.CreateOrUpdateReport;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateRole {
        namespace Parameters {
            export type RoleUID = string;
        }
        export interface PathParameters {
            roleUID: Parameters.RoleUID;
        }
        export type RequestBody = Components.Schemas.UpdateRoleCommand;
        namespace Responses {
            export type $200 = Components.Responses.GetRoleResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateServiceAccount {
        namespace Parameters {
            export type ServiceAccountId = number; // int64
        }
        export interface PathParameters {
            serviceAccountId: Parameters.ServiceAccountId /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateServiceAccountForm;
        namespace Responses {
            export type $200 = Components.Responses.UpdateServiceAccountResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateSignedInUser {
        export type RequestBody = Components.Schemas.UpdateUserCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateTeam {
        namespace Parameters {
            export type TeamId = string;
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
        }
        export type RequestBody = Components.Schemas.UpdateTeamCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateTeamLBACRulesApi {
        namespace Parameters {
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
        }
        export type RequestBody = Components.Schemas.UpdateTeamLBACCommand;
        namespace Responses {
            export type $200 = Components.Responses.UpdateTeamLBACRulesResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateTeamMember {
        namespace Parameters {
            export type TeamId = string;
            export type UserId = number; // int64
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
            user_id: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateTeamMemberCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateTeamPreferences {
        namespace Parameters {
            export type TeamId = string;
        }
        export interface PathParameters {
            team_id: Parameters.TeamId;
        }
        export type RequestBody = Components.Schemas.UpdatePrefsCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateUser {
        namespace Parameters {
            export type UserId = number; // int64
        }
        export interface PathParameters {
            user_id: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateUserCommand;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $409 = Components.Responses.ConflictError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateUserEmail {
        namespace Responses {
            export type $302 = Components.Responses.OkResponse;
        }
    }
    namespace UpdateUserPreferences {
        export type RequestBody = Components.Schemas.UpdatePrefsCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UpdateUserQuota {
        namespace Parameters {
            export type QuotaTarget = string;
            export type UserId = number; // int64
        }
        export interface PathParameters {
            quota_target: Parameters.QuotaTarget;
            user_id: Parameters.UserId /* int64 */;
        }
        export type RequestBody = Components.Schemas.UpdateQuotaCmd;
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $404 = Components.Responses.NotFoundError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UploadSnapshot {
        namespace Parameters {
            export type SnapshotUid = string;
            export type Uid = string;
        }
        export interface PathParameters {
            uid: Parameters.Uid;
            snapshotUid: Parameters.SnapshotUid;
        }
        namespace Responses {
            export interface $200 {
            }
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace UserSetUsingOrg {
        namespace Parameters {
            export type OrgId = number; // int64
        }
        export interface PathParameters {
            org_id: Parameters.OrgId /* int64 */;
        }
        namespace Responses {
            export type $200 = Components.Responses.OkResponse;
            export type $400 = Components.Responses.BadRequestError;
            export type $401 = Components.Responses.UnauthorisedError;
            export type $403 = Components.Responses.ForbiddenError;
            export type $500 = Components.Responses.InternalServerError;
        }
    }
    namespace ViewPublicDashboard {
        namespace Parameters {
            export type AccessToken = string;
        }
        export interface PathParameters {
            accessToken: Parameters.AccessToken;
        }
        namespace Responses {
            export type $200 = Components.Responses.ViewPublicDashboardResponse;
            export type $400 = Components.Responses.BadRequestPublicError;
            export type $401 = Components.Responses.UnauthorisedPublicError;
            export type $403 = Components.Responses.ForbiddenPublicError;
            export type $404 = Components.Responses.NotFoundPublicError;
            export type $500 = Components.Responses.InternalServerPublicError;
        }
    }
}

export interface OperationMethods {
  /**
   * searchResult - Debug permissions.
   * 
   * Returns the result of the search through access-control role assignments.
   * 
   * You need to have a permission with action `teams.roles:read` on scope `teams:*`
   * and a permission with action `users.roles:read` on scope `users:*`.
   */
  'searchResult'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchResult.Responses.$200>
  /**
   * listRoles - Get all roles.
   * 
   * Gets all existing roles. The response contains all global and organization local roles, for the organization which user is signed in.
   * 
   * You need to have a permission with action `roles:read` and scope `roles:*`.
   * 
   * The `delegatable` flag reduces the set of roles to only those for which the signed-in user has permissions to assign.
   */
  'listRoles'(
    parameters?: Parameters<Paths.ListRoles.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListRoles.Responses.$200>
  /**
   * createRole - Create a new custom role.
   * 
   * Creates a new custom role and maps given permissions to that role. Note that roles with the same prefix as Fixed Roles can’t be created.
   * 
   * You need to have a permission with action `roles:write` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only create custom roles with the same, or a subset of permissions which the user has.
   * For example, if a user does not have required permissions for creating users, they won’t be able to create a custom role which allows to do that. This is done to prevent escalation of privileges.
   */
  'createRole'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateRole.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateRole.Responses.$201>
  /**
   * getRole - Get a role.
   * 
   * Get a role for the given UID.
   * 
   * You need to have a permission with action `roles:read` and scope `roles:*`.
   */
  'getRole'(
    parameters?: Parameters<Paths.GetRole.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetRole.Responses.$200>
  /**
   * updateRole - Update a custom role.
   * 
   * You need to have a permission with action `roles:write` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only create custom roles with the same, or a subset of permissions which the user has.
   */
  'updateRole'(
    parameters?: Parameters<Paths.UpdateRole.PathParameters> | null,
    data?: Paths.UpdateRole.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateRole.Responses.$200>
  /**
   * deleteRole - Delete a custom role.
   * 
   * Delete a role with the given UID, and it’s permissions. If the role is assigned to a built-in role, the deletion operation will fail, unless force query param is set to true, and in that case all assignments will also be deleted.
   * 
   * You need to have a permission with action `roles:delete` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only delete a custom role with the same, or a subset of permissions which the user has. For example, if a user does not have required permissions for creating users, they won’t be able to delete a custom role which allows to do that.
   */
  'deleteRole'(
    parameters?: Parameters<Paths.DeleteRole.QueryParameters & Paths.DeleteRole.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteRole.Responses.$200>
  /**
   * getRoleAssignments - Get role assignments.
   * 
   * Get role assignments for the role with the given UID.
   * Does not include role assignments mapped through group attribute sync.
   * 
   * You need to have a permission with action `teams.roles:list` and scope `teams:id:*` and `users.roles:list` and scope `users:id:*`.
   */
  'getRoleAssignments'(
    parameters?: Parameters<Paths.GetRoleAssignments.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetRoleAssignments.Responses.$200>
  /**
   * setRoleAssignments - Set role assignments.
   * 
   * Set role assignments for the role with the given UID.
   * 
   * You need to have a permission with action `teams.roles:add` and `teams.roles:remove` and scope `permissions:type:delegate`, and `users.roles:add` and `users.roles:remove` and scope `permissions:type:delegate`.
   */
  'setRoleAssignments'(
    parameters?: Parameters<Paths.SetRoleAssignments.PathParameters> | null,
    data?: Paths.SetRoleAssignments.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetRoleAssignments.Responses.$200>
  /**
   * getAccessControlStatus - Get status.
   * 
   * Returns an indicator to check if fine-grained access control is enabled or not.
   * 
   * You need to have a permission with action `status:accesscontrol` and scope `services:accesscontrol`.
   */
  'getAccessControlStatus'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetAccessControlStatus.Responses.$200>
  /**
   * listTeamsRoles - List roles assigned to multiple teams.
   * 
   * Lists the roles that have been directly assigned to the given teams.
   * 
   * You need to have a permission with action `teams.roles:read` and scope `teams:id:*`.
   */
  'listTeamsRoles'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.ListTeamsRoles.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListTeamsRoles.Responses.$200>
  /**
   * listTeamRoles - Get team roles.
   * 
   * You need to have a permission with action `teams.roles:read` and scope `teams:id:<team ID>`.
   */
  'listTeamRoles'(
    parameters?: Parameters<Paths.ListTeamRoles.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListTeamRoles.Responses.$200>
  /**
   * setTeamRoles - Update team role.
   * 
   * You need to have a permission with action `teams.roles:add` and `teams.roles:remove` and scope `permissions:type:delegate` for each.
   */
  'setTeamRoles'(
    parameters?: Parameters<Paths.SetTeamRoles.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetTeamRoles.Responses.$200>
  /**
   * addTeamRole - Add team role.
   * 
   * You need to have a permission with action `teams.roles:add` and scope `permissions:type:delegate`.
   */
  'addTeamRole'(
    parameters?: Parameters<Paths.AddTeamRole.PathParameters> | null,
    data?: Paths.AddTeamRole.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddTeamRole.Responses.$200>
  /**
   * removeTeamRole - Remove team role.
   * 
   * You need to have a permission with action `teams.roles:remove` and scope `permissions:type:delegate`.
   */
  'removeTeamRole'(
    parameters?: Parameters<Paths.RemoveTeamRole.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RemoveTeamRole.Responses.$200>
  /**
   * listUsersRoles - List roles assigned to multiple users.
   * 
   * Lists the roles that have been directly assigned to the given users. The list does not include built-in roles (Viewer, Editor, Admin or Grafana Admin), and it does not include roles that have been inherited from a team.
   * 
   * You need to have a permission with action `users.roles:read` and scope `users:id:*`.
   */
  'listUsersRoles'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.ListUsersRoles.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListUsersRoles.Responses.$200>
  /**
   * listUserRoles - List roles assigned to a user.
   * 
   * Lists the roles that have been directly assigned to a given user. The list does not include built-in roles (Viewer, Editor, Admin or Grafana Admin), and it does not include roles that have been inherited from a team.
   * 
   * You need to have a permission with action `users.roles:read` and scope `users:id:<user ID>`.
   */
  'listUserRoles'(
    parameters?: Parameters<Paths.ListUserRoles.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListUserRoles.Responses.$200>
  /**
   * setUserRoles - Set user role assignments.
   * 
   * Update the user’s role assignments to match the provided set of UIDs. This will remove any assigned roles that aren’t in the request and add roles that are in the set but are not already assigned to the user.
   * Roles mapped through group attribute sync are not impacted.
   * If you want to add or remove a single role, consider using Add a user role assignment or Remove a user role assignment instead.
   * 
   * You need to have a permission with action `users.roles:add` and `users.roles:remove` and scope `permissions:type:delegate` for each. `permissions:type:delegate`  scope ensures that users can only assign or unassign roles which have same, or a subset of permissions which the user has. For example, if a user does not have required permissions for creating users, they won’t be able to assign or unassign a role which will allow to do that. This is done to prevent escalation of privileges.
   */
  'setUserRoles'(
    parameters?: Parameters<Paths.SetUserRoles.PathParameters> | null,
    data?: Paths.SetUserRoles.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetUserRoles.Responses.$200>
  /**
   * addUserRole - Add a user role assignment.
   * 
   * Assign a role to a specific user. For bulk updates consider Set user role assignments.
   * 
   * You need to have a permission with action `users.roles:add` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only assign roles which have same, or a subset of permissions which the user has. For example, if a user does not have required permissions for creating users, they won’t be able to assign a role which will allow to do that. This is done to prevent escalation of privileges.
   */
  'addUserRole'(
    parameters?: Parameters<Paths.AddUserRole.PathParameters> | null,
    data?: Paths.AddUserRole.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddUserRole.Responses.$200>
  /**
   * removeUserRole - Remove a user role assignment.
   * 
   * Revoke a role from a user. For bulk updates consider Set user role assignments.
   * 
   * You need to have a permission with action `users.roles:remove` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only unassign roles which have same, or a subset of permissions which the user has. For example, if a user does not have required permissions for creating users, they won’t be able to unassign a role which will allow to do that. This is done to prevent escalation of privileges.
   */
  'removeUserRole'(
    parameters?: Parameters<Paths.RemoveUserRole.QueryParameters & Paths.RemoveUserRole.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RemoveUserRole.Responses.$200>
  /**
   * getResourceDescription - Get a description of a resource's access control properties.
   */
  'getResourceDescription'(
    parameters?: Parameters<Paths.GetResourceDescription.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetResourceDescription.Responses.$200>
  /**
   * getResourcePermissions - Get permissions for a resource.
   */
  'getResourcePermissions'(
    parameters?: Parameters<Paths.GetResourcePermissions.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetResourcePermissions.Responses.$200>
  /**
   * setResourcePermissions - Set resource permissions.
   * 
   * Assigns permissions for a resource by a given type (`:resource`) and `:resourceID` to one or many
   * assignment types. Allowed resources are `datasources`, `teams`, `dashboards`, `folders`, and `serviceaccounts`.
   * Refer to the `/access-control/{resource}/description` endpoint for allowed Permissions.
   */
  'setResourcePermissions'(
    parameters?: Parameters<Paths.SetResourcePermissions.PathParameters> | null,
    data?: Paths.SetResourcePermissions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetResourcePermissions.Responses.$200>
  /**
   * setResourcePermissionsForBuiltInRole - Set resource permissions for a built-in role.
   * 
   * Assigns permissions for a resource by a given type (`:resource`) and `:resourceID` to a built-in role.
   * Allowed resources are `datasources`, `teams`, `dashboards`, `folders`, and `serviceaccounts`.
   * Refer to the `/access-control/{resource}/description` endpoint for allowed Permissions.
   */
  'setResourcePermissionsForBuiltInRole'(
    parameters?: Parameters<Paths.SetResourcePermissionsForBuiltInRole.PathParameters> | null,
    data?: Paths.SetResourcePermissionsForBuiltInRole.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetResourcePermissionsForBuiltInRole.Responses.$200>
  /**
   * setResourcePermissionsForTeam - Set resource permissions for a team.
   * 
   * Assigns permissions for a resource by a given type (`:resource`) and `:resourceID` to a team.
   * Allowed resources are `datasources`, `teams`, `dashboards`, `folders`, and `serviceaccounts`.
   * Refer to the `/access-control/{resource}/description` endpoint for allowed Permissions.
   */
  'setResourcePermissionsForTeam'(
    parameters?: Parameters<Paths.SetResourcePermissionsForTeam.PathParameters> | null,
    data?: Paths.SetResourcePermissionsForTeam.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetResourcePermissionsForTeam.Responses.$200>
  /**
   * setResourcePermissionsForUser - Set resource permissions for a user.
   * 
   * Assigns permissions for a resource by a given type (`:resource`) and `:resourceID` to a user or a service account.
   * Allowed resources are `datasources`, `teams`, `dashboards`, `folders`, and `serviceaccounts`.
   * Refer to the `/access-control/{resource}/description` endpoint for allowed Permissions.
   */
  'setResourcePermissionsForUser'(
    parameters?: Parameters<Paths.SetResourcePermissionsForUser.PathParameters> | null,
    data?: Paths.SetResourcePermissionsForUser.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetResourcePermissionsForUser.Responses.$200>
  /**
   * getSyncStatus - Returns the current state of the LDAP background sync integration.
   * 
   * You need to have a permission with action `ldap.status:read`.
   */
  'getSyncStatus'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSyncStatus.Responses.$200>
  /**
   * reloadLDAPCfg - Reloads the LDAP configuration.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `ldap.config:reload`.
   */
  'reloadLDAPCfg'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ReloadLDAPCfg.Responses.$200>
  /**
   * getLDAPStatus - Attempts to connect to all the configured LDAP servers and returns information on whenever they're available or not.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `ldap.status:read`.
   */
  'getLDAPStatus'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetLDAPStatus.Responses.$200>
  /**
   * postSyncUserWithLDAP - Enables a single Grafana user to be synchronized against LDAP.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `ldap.user:sync`.
   */
  'postSyncUserWithLDAP'(
    parameters?: Parameters<Paths.PostSyncUserWithLDAP.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PostSyncUserWithLDAP.Responses.$200>
  /**
   * getUserFromLDAP - Finds an user based on a username in LDAP. This helps illustrate how would the particular user be mapped in Grafana when synced.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `ldap.user:read`.
   */
  'getUserFromLDAP'(
    parameters?: Parameters<Paths.GetUserFromLDAP.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUserFromLDAP.Responses.$200>
  /**
   * adminProvisioningReloadAccessControl - You need to have a permission with action `provisioning:reload` with scope `provisioners:accesscontrol`.
   */
  'adminProvisioningReloadAccessControl'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminProvisioningReloadAccessControl.Responses.$202>
  /**
   * adminProvisioningReloadDashboards - Reload dashboard provisioning configurations.
   * 
   * Reloads the provisioning config files for dashboards again. It won’t return until the new provisioned entities are already stored in the database. In case of dashboards, it will stop polling for changes in dashboard files and then restart it with new configurations after returning.
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `provisioning:reload` and scope `provisioners:dashboards`.
   */
  'adminProvisioningReloadDashboards'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminProvisioningReloadDashboards.Responses.$200>
  /**
   * adminProvisioningReloadDatasources - Reload datasource provisioning configurations.
   * 
   * Reloads the provisioning config files for datasources again. It won’t return until the new provisioned entities are already stored in the database. In case of dashboards, it will stop polling for changes in dashboard files and then restart it with new configurations after returning.
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `provisioning:reload` and scope `provisioners:datasources`.
   */
  'adminProvisioningReloadDatasources'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminProvisioningReloadDatasources.Responses.$200>
  /**
   * adminProvisioningReloadPlugins - Reload plugin provisioning configurations.
   * 
   * Reloads the provisioning config files for plugins again. It won’t return until the new provisioned entities are already stored in the database. In case of dashboards, it will stop polling for changes in dashboard files and then restart it with new configurations after returning.
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `provisioning:reload` and scope `provisioners:plugin`.
   */
  'adminProvisioningReloadPlugins'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminProvisioningReloadPlugins.Responses.$200>
  /**
   * adminGetSettings - Fetch settings.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `settings:read` and scopes: `settings:*`, `settings:auth.saml:` and `settings:auth.saml:enabled` (property level).
   */
  'adminGetSettings'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminGetSettings.Responses.$200>
  /**
   * adminGetStats - Fetch Grafana Stats.
   * 
   * Only works with Basic Authentication (username and password). See introduction for an explanation.
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `server:stats:read`.
   */
  'adminGetStats'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminGetStats.Responses.$200>
  /**
   * adminCreateUser - Create new user.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users:create`.
   * Note that OrgId is an optional parameter that can be used to assign a new user to a different organization when `auto_assign_org` is set to `true`.
   */
  'adminCreateUser'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.AdminCreateUser.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminCreateUser.Responses.$200>
  /**
   * adminDeleteUser - Delete global User.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users:delete` and scope `global.users:*`.
   */
  'adminDeleteUser'(
    parameters?: Parameters<Paths.AdminDeleteUser.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminDeleteUser.Responses.$200>
  /**
   * adminGetUserAuthTokens - Return a list of all auth tokens (devices) that the user currently have logged in from.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.authtoken:list` and scope `global.users:*`.
   */
  'adminGetUserAuthTokens'(
    parameters?: Parameters<Paths.AdminGetUserAuthTokens.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminGetUserAuthTokens.Responses.$200>
  /**
   * adminDisableUser - Disable user.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users:disable` and scope `global.users:1` (userIDScope).
   */
  'adminDisableUser'(
    parameters?: Parameters<Paths.AdminDisableUser.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminDisableUser.Responses.$200>
  /**
   * adminEnableUser - Enable user.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users:enable` and scope `global.users:1` (userIDScope).
   */
  'adminEnableUser'(
    parameters?: Parameters<Paths.AdminEnableUser.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminEnableUser.Responses.$200>
  /**
   * adminLogoutUser - Logout user revokes all auth tokens (devices) for the user. User of issued auth tokens (devices) will no longer be logged in and will be required to authenticate again upon next activity.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.logout` and scope `global.users:*`.
   */
  'adminLogoutUser'(
    parameters?: Parameters<Paths.AdminLogoutUser.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminLogoutUser.Responses.$200>
  /**
   * adminUpdateUserPassword - Set password for user.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.password:update` and scope `global.users:*`.
   */
  'adminUpdateUserPassword'(
    parameters?: Parameters<Paths.AdminUpdateUserPassword.PathParameters> | null,
    data?: Paths.AdminUpdateUserPassword.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminUpdateUserPassword.Responses.$200>
  /**
   * adminUpdateUserPermissions - Set permissions for user.
   * 
   * Only works with Basic Authentication (username and password). See introduction for an explanation.
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.permissions:update` and scope `global.users:*`.
   */
  'adminUpdateUserPermissions'(
    parameters?: Parameters<Paths.AdminUpdateUserPermissions.PathParameters> | null,
    data?: Paths.AdminUpdateUserPermissions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminUpdateUserPermissions.Responses.$200>
  /**
   * getUserQuota - Fetch user quota.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.quotas:list` and scope `global.users:1` (userIDScope).
   */
  'getUserQuota'(
    parameters?: Parameters<Paths.GetUserQuota.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUserQuota.Responses.$200>
  /**
   * updateUserQuota - Update user quota.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.quotas:update` and scope `global.users:1` (userIDScope).
   */
  'updateUserQuota'(
    parameters?: Parameters<Paths.UpdateUserQuota.PathParameters> | null,
    data?: Paths.UpdateUserQuota.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateUserQuota.Responses.$200>
  /**
   * adminRevokeUserAuthToken - Revoke auth token for user.
   * 
   * Revokes the given auth token (device) for the user. User of issued auth token (device) will no longer be logged in and will be required to authenticate again upon next activity.
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.authtoken:update` and scope `global.users:*`.
   */
  'adminRevokeUserAuthToken'(
    parameters?: Parameters<Paths.AdminRevokeUserAuthToken.PathParameters> | null,
    data?: Paths.AdminRevokeUserAuthToken.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AdminRevokeUserAuthToken.Responses.$200>
  /**
   * getAnnotations - Find Annotations.
   * 
   * Starting in Grafana v6.4 regions annotations are now returned in one entity that now includes the timeEnd property.
   */
  'getAnnotations'(
    parameters?: Parameters<Paths.GetAnnotations.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetAnnotations.Responses.$200>
  /**
   * postAnnotation - Create Annotation.
   * 
   * Creates an annotation in the Grafana database. The dashboardId and panelId fields are optional. If they are not specified then an organization annotation is created and can be queried in any dashboard that adds the Grafana annotations data source. When creating a region annotation include the timeEnd property.
   * The format for `time` and `timeEnd` should be epoch numbers in millisecond resolution.
   * The response for this HTTP request is slightly different in versions prior to v6.4. In prior versions you would also get an endId if you where creating a region. But in 6.4 regions are represented using a single event with time and timeEnd properties.
   */
  'postAnnotation'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.PostAnnotation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PostAnnotation.Responses.$200>
  /**
   * postGraphiteAnnotation - Create Annotation in Graphite format.
   * 
   * Creates an annotation by using Graphite-compatible event format. The `when` and `data` fields are optional. If `when` is not specified then the current time will be used as annotation’s timestamp. The `tags` field can also be in prior to Graphite `0.10.0` format (string with multiple tags being separated by a space).
   */
  'postGraphiteAnnotation'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.PostGraphiteAnnotation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PostGraphiteAnnotation.Responses.$200>
  /**
   * massDeleteAnnotations - Delete multiple annotations.
   */
  'massDeleteAnnotations'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.MassDeleteAnnotations.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.MassDeleteAnnotations.Responses.$200>
  /**
   * getAnnotationTags - Find Annotations Tags.
   * 
   * Find all the event tags created in the annotations.
   */
  'getAnnotationTags'(
    parameters?: Parameters<Paths.GetAnnotationTags.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetAnnotationTags.Responses.$200>
  /**
   * getAnnotationByID - Get Annotation by ID.
   */
  'getAnnotationByID'(
    parameters?: Parameters<Paths.GetAnnotationByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetAnnotationByID.Responses.$200>
  /**
   * updateAnnotation - Update Annotation.
   * 
   * Updates all properties of an annotation that matches the specified id. To only update certain property, consider using the Patch Annotation operation.
   */
  'updateAnnotation'(
    parameters?: Parameters<Paths.UpdateAnnotation.PathParameters> | null,
    data?: Paths.UpdateAnnotation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateAnnotation.Responses.$200>
  /**
   * patchAnnotation - Patch Annotation.
   * 
   * Updates one or more properties of an annotation that matches the specified ID.
   * This operation currently supports updating of the `text`, `tags`, `time` and `timeEnd` properties.
   * This is available in Grafana 6.0.0-beta2 and above.
   */
  'patchAnnotation'(
    parameters?: Parameters<Paths.PatchAnnotation.PathParameters> | null,
    data?: Paths.PatchAnnotation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PatchAnnotation.Responses.$200>
  /**
   * deleteAnnotationByID - Delete Annotation By ID.
   * 
   * Deletes the annotation that matches the specified ID.
   */
  'deleteAnnotationByID'(
    parameters?: Parameters<Paths.DeleteAnnotationByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteAnnotationByID.Responses.$200>
  /**
   * getAPIkeys - Get auth keys.
   * 
   * Will return auth keys.
   * 
   * Deprecated: true.
   * 
   * Deprecated. Please use GET /api/serviceaccounts and GET /api/serviceaccounts/{id}/tokens instead
   * see https://grafana.com/docs/grafana/next/administration/service-accounts/migrate-api-keys/.
   */
  'getAPIkeys'(
    parameters?: Parameters<Paths.GetAPIkeys.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetAPIkeys.Responses.$200>
  /**
   * addAPIkey - Creates an API key.
   * 
   * Will return details of the created API key.
   */
  'addAPIkey'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * deleteAPIkey - Delete API key.
   * 
   * Deletes an API key.
   * Deprecated. See: https://grafana.com/docs/grafana/next/administration/service-accounts/migrate-api-keys/.
   */
  'deleteAPIkey'(
    parameters?: Parameters<Paths.DeleteAPIkey.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteAPIkey.Responses.$200>
  /**
   * getSessionList - Get a list of all cloud migration sessions that have been created.
   */
  'getSessionList'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSessionList.Responses.$200>
  /**
   * createSession - Create a migration session.
   */
  'createSession'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateSession.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateSession.Responses.$200>
  /**
   * getSession - Get a cloud migration session by its uid.
   */
  'getSession'(
    parameters?: Parameters<Paths.GetSession.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSession.Responses.$200>
  /**
   * deleteSession - Delete a migration session by its uid.
   */
  'deleteSession'(
    parameters?: Parameters<Paths.DeleteSession.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * createSnapshot - Trigger the creation of an instance snapshot associated with the provided session.
   * 
   * If the snapshot initialization is successful, the snapshot uid is returned.
   */
  'createSnapshot'(
    parameters?: Parameters<Paths.CreateSnapshot.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateSnapshot.Responses.$200>
  /**
   * getSnapshot - Get metadata about a snapshot, including where it is in its processing and final results.
   */
  'getSnapshot'(
    parameters?: Parameters<Paths.GetSnapshot.QueryParameters & Paths.GetSnapshot.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSnapshot.Responses.$200>
  /**
   * cancelSnapshot - Cancel a snapshot, wherever it is in its processing chain.
   * 
   * TODO: Implement
   */
  'cancelSnapshot'(
    parameters?: Parameters<Paths.CancelSnapshot.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CancelSnapshot.Responses.$200>
  /**
   * uploadSnapshot - Upload a snapshot to the Grafana Migration Service for processing.
   */
  'uploadSnapshot'(
    parameters?: Parameters<Paths.UploadSnapshot.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UploadSnapshot.Responses.$200>
  /**
   * getShapshotList - Get a list of snapshots for a session.
   */
  'getShapshotList'(
    parameters?: Parameters<Paths.GetShapshotList.QueryParameters & Paths.GetShapshotList.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetShapshotList.Responses.$200>
  /**
   * getCloudMigrationToken - Fetch the cloud migration token if it exists.
   */
  'getCloudMigrationToken'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCloudMigrationToken.Responses.$200>
  /**
   * createCloudMigrationToken - Create gcom access token.
   */
  'createCloudMigrationToken'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateCloudMigrationToken.Responses.$200>
  /**
   * deleteCloudMigrationToken - Deletes a cloud migration token.
   */
  'deleteCloudMigrationToken'(
    parameters?: Parameters<Paths.DeleteCloudMigrationToken.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteCloudMigrationToken.Responses.$204>
  /**
   * searchDashboardSnapshots - List snapshots.
   */
  'searchDashboardSnapshots'(
    parameters?: Parameters<Paths.SearchDashboardSnapshots.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchDashboardSnapshots.Responses.$200>
  /**
   * calculateDashboardDiff - Perform diff on two dashboards.
   */
  'calculateDashboardDiff'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CalculateDashboardDiff.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CalculateDashboardDiff.Responses.$200>
  /**
   * postDashboard - Create / Update dashboard
   * 
   * Creates a new dashboard or updates an existing dashboard.
   * Note: This endpoint is not intended for creating folders, use `POST /api/folders` for that.
   */
  'postDashboard'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.PostDashboard.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PostDashboard.Responses.$200>
  /**
   * getHomeDashboard - Get home dashboard.
   */
  'getHomeDashboard'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetHomeDashboard.Responses.$200>
  /**
   * getDashboardPermissionsListByID - Gets all existing permissions for the given dashboard.
   * 
   * Please refer to [updated API](#/dashboard_permissions/getDashboardPermissionsListByUID) instead
   */
  'getDashboardPermissionsListByID'(
    parameters?: Parameters<Paths.GetDashboardPermissionsListByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDashboardPermissionsListByID.Responses.$200>
  /**
   * updateDashboardPermissionsByID - Updates permissions for a dashboard.
   * 
   * Please refer to [updated API](#/dashboard_permissions/updateDashboardPermissionsByUID) instead
   * 
   * This operation will remove existing permissions if they’re not included in the request.
   */
  'updateDashboardPermissionsByID'(
    parameters?: Parameters<Paths.UpdateDashboardPermissionsByID.PathParameters> | null,
    data?: Paths.UpdateDashboardPermissionsByID.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateDashboardPermissionsByID.Responses.$200>
  /**
   * restoreDashboardVersionByID - Restore a dashboard to a given dashboard version.
   * 
   * Please refer to [updated API](#/dashboard_versions/restoreDashboardVersionByUID) instead
   */
  'restoreDashboardVersionByID'(
    parameters?: Parameters<Paths.RestoreDashboardVersionByID.PathParameters> | null,
    data?: Paths.RestoreDashboardVersionByID.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RestoreDashboardVersionByID.Responses.$200>
  /**
   * getDashboardVersionsByID - Gets all existing versions for the dashboard.
   * 
   * Please refer to [updated API](#/dashboard_versions/getDashboardVersionsByUID) instead
   */
  'getDashboardVersionsByID'(
    parameters?: Parameters<Paths.GetDashboardVersionsByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDashboardVersionsByID.Responses.$200>
  /**
   * getDashboardVersionByID - Get a specific dashboard version.
   * 
   * Please refer to [updated API](#/dashboard_versions/getDashboardVersionByUID) instead
   */
  'getDashboardVersionByID'(
    parameters?: Parameters<Paths.GetDashboardVersionByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDashboardVersionByID.Responses.$200>
  /**
   * importDashboard - Import dashboard.
   */
  'importDashboard'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.ImportDashboard.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ImportDashboard.Responses.$200>
  /**
   * listPublicDashboards - Get list of public dashboards
   */
  'listPublicDashboards'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListPublicDashboards.Responses.$200>
  /**
   * getDashboardTags - Get all dashboards tags of an organisation.
   */
  'getDashboardTags'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDashboardTags.Responses.$200>
  /**
   * getPublicDashboard - Get public dashboard by dashboardUid
   */
  'getPublicDashboard'(
    parameters?: Parameters<Paths.GetPublicDashboard.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetPublicDashboard.Responses.$200>
  /**
   * createPublicDashboard - Create public dashboard for a dashboard
   */
  'createPublicDashboard'(
    parameters?: Parameters<Paths.CreatePublicDashboard.PathParameters> | null,
    data?: Paths.CreatePublicDashboard.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreatePublicDashboard.Responses.$200>
  /**
   * updatePublicDashboard - Update public dashboard for a dashboard
   */
  'updatePublicDashboard'(
    parameters?: Parameters<Paths.UpdatePublicDashboard.PathParameters> | null,
    data?: Paths.UpdatePublicDashboard.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdatePublicDashboard.Responses.$200>
  /**
   * deletePublicDashboard - Delete public dashboard for a dashboard
   */
  'deletePublicDashboard'(
    parameters?: Parameters<Paths.DeletePublicDashboard.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeletePublicDashboard.Responses.$200>
  /**
   * getDashboardByUID - Get dashboard by uid.
   * 
   * Will return the dashboard given the dashboard unique identifier (uid).
   */
  'getDashboardByUID'(
    parameters?: Parameters<Paths.GetDashboardByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDashboardByUID.Responses.$200>
  /**
   * deleteDashboardByUID - Delete dashboard by uid.
   * 
   * Will delete the dashboard given the specified unique identifier (uid).
   */
  'deleteDashboardByUID'(
    parameters?: Parameters<Paths.DeleteDashboardByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteDashboardByUID.Responses.$200>
  /**
   * getDashboardPermissionsListByUID - Gets all existing permissions for the given dashboard.
   */
  'getDashboardPermissionsListByUID'(
    parameters?: Parameters<Paths.GetDashboardPermissionsListByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDashboardPermissionsListByUID.Responses.$200>
  /**
   * updateDashboardPermissionsByUID - Updates permissions for a dashboard.
   * 
   * This operation will remove existing permissions if they’re not included in the request.
   */
  'updateDashboardPermissionsByUID'(
    parameters?: Parameters<Paths.UpdateDashboardPermissionsByUID.PathParameters> | null,
    data?: Paths.UpdateDashboardPermissionsByUID.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateDashboardPermissionsByUID.Responses.$200>
  /**
   * restoreDashboardVersionByUID - Restore a dashboard to a given dashboard version using UID.
   */
  'restoreDashboardVersionByUID'(
    parameters?: Parameters<Paths.RestoreDashboardVersionByUID.PathParameters> | null,
    data?: Paths.RestoreDashboardVersionByUID.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RestoreDashboardVersionByUID.Responses.$200>
  /**
   * restoreDeletedDashboardByUID - Restore a dashboard to a given dashboard version using UID.
   */
  'restoreDeletedDashboardByUID'(
    parameters?: Parameters<Paths.RestoreDeletedDashboardByUID.PathParameters> | null,
    data?: Paths.RestoreDeletedDashboardByUID.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RestoreDeletedDashboardByUID.Responses.$200>
  /**
   * hardDeleteDashboardByUID - Hard delete dashboard by uid.
   * 
   * Will delete the dashboard given the specified unique identifier (uid).
   */
  'hardDeleteDashboardByUID'(
    parameters?: Parameters<Paths.HardDeleteDashboardByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.HardDeleteDashboardByUID.Responses.$200>
  /**
   * getDashboardVersionsByUID - Gets all existing versions for the dashboard using UID.
   */
  'getDashboardVersionsByUID'(
    parameters?: Parameters<Paths.GetDashboardVersionsByUID.QueryParameters & Paths.GetDashboardVersionsByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDashboardVersionsByUID.Responses.$200>
  /**
   * getDashboardVersionByUID - Get a specific dashboard version using UID.
   */
  'getDashboardVersionByUID'(
    parameters?: Parameters<Paths.GetDashboardVersionByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDashboardVersionByUID.Responses.$200>
  /**
   * getDataSources - Get all data sources.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:read` and scope: `datasources:*`.
   */
  'getDataSources'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDataSources.Responses.$200>
  /**
   * addDataSource - Create a data source.
   * 
   * By defining `password` and `basicAuthPassword` under secureJsonData property
   * Grafana encrypts them securely as an encrypted blob in the database.
   * The response then lists the encrypted fields under secureJsonFields.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:create`
   */
  'addDataSource'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.AddDataSource.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddDataSource.Responses.$200>
  /**
   * getCorrelations - Gets all correlations.
   */
  'getCorrelations'(
    parameters?: Parameters<Paths.GetCorrelations.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCorrelations.Responses.$200>
  /**
   * getDataSourceIdByName - Get data source Id by Name.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:read` and scopes: `datasources:*`, `datasources:name:*` and `datasources:name:test_datasource` (single data source).
   */
  'getDataSourceIdByName'(
    parameters?: Parameters<Paths.GetDataSourceIdByName.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDataSourceIdByName.Responses.$200>
  /**
   * getDataSourceByName - Get a single data source by Name.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:read` and scopes: `datasources:*`, `datasources:name:*` and `datasources:name:test_datasource` (single data source).
   */
  'getDataSourceByName'(
    parameters?: Parameters<Paths.GetDataSourceByName.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDataSourceByName.Responses.$200>
  /**
   * deleteDataSourceByName - Delete an existing data source by name.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:delete` and scopes: `datasources:*`, `datasources:name:*` and `datasources:name:test_datasource` (single data source).
   */
  'deleteDataSourceByName'(
    parameters?: Parameters<Paths.DeleteDataSourceByName.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteDataSourceByName.Responses.$200>
  /**
   * datasourceProxyGETByUIDcalls - Data source proxy GET calls.
   * 
   * Proxies all calls to the actual data source.
   */
  'datasourceProxyGETByUIDcalls'(
    parameters?: Parameters<Paths.DatasourceProxyGETByUIDcalls.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DatasourceProxyGETByUIDcalls.Responses.$200>
  /**
   * datasourceProxyPOSTByUIDcalls - Data source proxy POST calls.
   * 
   * Proxies all calls to the actual data source. The data source should support POST methods for the specific path and role as defined
   */
  'datasourceProxyPOSTByUIDcalls'(
    parameters?: Parameters<Paths.DatasourceProxyPOSTByUIDcalls.PathParameters> | null,
    data?: Paths.DatasourceProxyPOSTByUIDcalls.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DatasourceProxyPOSTByUIDcalls.Responses.$201 | Paths.DatasourceProxyPOSTByUIDcalls.Responses.$202>
  /**
   * datasourceProxyDELETEByUIDcalls - Data source proxy DELETE calls.
   * 
   * Proxies all calls to the actual data source.
   */
  'datasourceProxyDELETEByUIDcalls'(
    parameters?: Parameters<Paths.DatasourceProxyDELETEByUIDcalls.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DatasourceProxyDELETEByUIDcalls.Responses.$202>
  /**
   * datasourceProxyGETcalls - Data source proxy GET calls.
   * 
   * Proxies all calls to the actual data source.
   * 
   * Please refer to [updated API](#/datasources/datasourceProxyGETByUIDcalls) instead
   */
  'datasourceProxyGETcalls'(
    parameters?: Parameters<Paths.DatasourceProxyGETcalls.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DatasourceProxyGETcalls.Responses.$200>
  /**
   * datasourceProxyPOSTcalls - Data source proxy POST calls.
   * 
   * Proxies all calls to the actual data source. The data source should support POST methods for the specific path and role as defined
   * 
   * Please refer to [updated API](#/datasources/datasourceProxyPOSTByUIDcalls) instead
   */
  'datasourceProxyPOSTcalls'(
    parameters?: Parameters<Paths.DatasourceProxyPOSTcalls.PathParameters> | null,
    data?: Paths.DatasourceProxyPOSTcalls.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DatasourceProxyPOSTcalls.Responses.$201 | Paths.DatasourceProxyPOSTcalls.Responses.$202>
  /**
   * datasourceProxyDELETEcalls - Data source proxy DELETE calls.
   * 
   * Proxies all calls to the actual data source.
   * 
   * Please refer to [updated API](#/datasources/datasourceProxyDELETEByUIDcalls) instead
   */
  'datasourceProxyDELETEcalls'(
    parameters?: Parameters<Paths.DatasourceProxyDELETEcalls.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DatasourceProxyDELETEcalls.Responses.$202>
  /**
   * getCorrelationsBySourceUID - Gets all correlations originating from the given data source.
   */
  'getCorrelationsBySourceUID'(
    parameters?: Parameters<Paths.GetCorrelationsBySourceUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCorrelationsBySourceUID.Responses.$200>
  /**
   * createCorrelation - Add correlation.
   */
  'createCorrelation'(
    parameters?: Parameters<Paths.CreateCorrelation.PathParameters> | null,
    data?: Paths.CreateCorrelation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateCorrelation.Responses.$200>
  /**
   * getCorrelation - Gets a correlation.
   */
  'getCorrelation'(
    parameters?: Parameters<Paths.GetCorrelation.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCorrelation.Responses.$200>
  /**
   * updateCorrelation - Updates a correlation.
   */
  'updateCorrelation'(
    parameters?: Parameters<Paths.UpdateCorrelation.PathParameters> | null,
    data?: Paths.UpdateCorrelation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateCorrelation.Responses.$200>
  /**
   * getDataSourceByUID - Get a single data source by UID.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:read` and scopes: `datasources:*`, `datasources:uid:*` and `datasources:uid:kLtEtcRGk` (single data source).
   */
  'getDataSourceByUID'(
    parameters?: Parameters<Paths.GetDataSourceByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDataSourceByUID.Responses.$200>
  /**
   * updateDataSourceByUID - Update an existing data source.
   * 
   * Similar to creating a data source, `password` and `basicAuthPassword` should be defined under
   * secureJsonData in order to be stored securely as an encrypted blob in the database. Then, the
   * encrypted fields are listed under secureJsonFields section in the response.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:write` and scopes: `datasources:*`, `datasources:uid:*` and `datasources:uid:1` (single data source).
   */
  'updateDataSourceByUID'(
    parameters?: Parameters<Paths.UpdateDataSourceByUID.PathParameters> | null,
    data?: Paths.UpdateDataSourceByUID.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateDataSourceByUID.Responses.$200>
  /**
   * deleteDataSourceByUID - Delete an existing data source by UID.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:delete` and scopes: `datasources:*`, `datasources:uid:*` and `datasources:uid:kLtEtcRGk` (single data source).
   */
  'deleteDataSourceByUID'(
    parameters?: Parameters<Paths.DeleteDataSourceByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteDataSourceByUID.Responses.$200>
  /**
   * deleteCorrelation - Delete a correlation.
   */
  'deleteCorrelation'(
    parameters?: Parameters<Paths.DeleteCorrelation.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteCorrelation.Responses.$200>
  /**
   * checkDatasourceHealthWithUID - Sends a health check request to the plugin datasource identified by the UID.
   */
  'checkDatasourceHealthWithUID'(
    parameters?: Parameters<Paths.CheckDatasourceHealthWithUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CheckDatasourceHealthWithUID.Responses.$200>
  /**
   * getTeamLBACRulesApi - Retrieves LBAC rules for a team.
   */
  'getTeamLBACRulesApi'(
    parameters?: Parameters<Paths.GetTeamLBACRulesApi.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetTeamLBACRulesApi.Responses.$200>
  /**
   * updateTeamLBACRulesApi - Updates LBAC rules for a team.
   */
  'updateTeamLBACRulesApi'(
    parameters?: Parameters<Paths.UpdateTeamLBACRulesApi.PathParameters> | null,
    data?: Paths.UpdateTeamLBACRulesApi.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateTeamLBACRulesApi.Responses.$200>
  /**
   * callDatasourceResourceWithUID - Fetch data source resources.
   */
  'callDatasourceResourceWithUID'(
    parameters?: Parameters<Paths.CallDatasourceResourceWithUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CallDatasourceResourceWithUID.Responses.$200>
  /**
   * getDataSourceCacheConfig - get cache config for a single data source
   */
  'getDataSourceCacheConfig'(
    parameters?: Parameters<Paths.GetDataSourceCacheConfig.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDataSourceCacheConfig.Responses.$200>
  /**
   * setDataSourceCacheConfig - set cache config for a single data source
   */
  'setDataSourceCacheConfig'(
    parameters?: Parameters<Paths.SetDataSourceCacheConfig.PathParameters> | null,
    data?: Paths.SetDataSourceCacheConfig.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetDataSourceCacheConfig.Responses.$200>
  /**
   * cleanDataSourceCache - clean cache for a single data source
   */
  'cleanDataSourceCache'(
    parameters?: Parameters<Paths.CleanDataSourceCache.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CleanDataSourceCache.Responses.$200>
  /**
   * disableDataSourceCache - disable cache for a single data source
   */
  'disableDataSourceCache'(
    parameters?: Parameters<Paths.DisableDataSourceCache.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DisableDataSourceCache.Responses.$200>
  /**
   * enableDataSourceCache - enable cache for a single data source
   */
  'enableDataSourceCache'(
    parameters?: Parameters<Paths.EnableDataSourceCache.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.EnableDataSourceCache.Responses.$200>
  /**
   * getDataSourceByID - Get a single data source by Id.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:read` and scopes: `datasources:*`, `datasources:id:*` and `datasources:id:1` (single data source).
   * 
   * Please refer to [updated API](#/datasources/getDataSourceByUID) instead
   */
  'getDataSourceByID'(
    parameters?: Parameters<Paths.GetDataSourceByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDataSourceByID.Responses.$200>
  /**
   * updateDataSourceByID - Update an existing data source by its sequential ID.
   * 
   * Similar to creating a data source, `password` and `basicAuthPassword` should be defined under
   * secureJsonData in order to be stored securely as an encrypted blob in the database. Then, the
   * encrypted fields are listed under secureJsonFields section in the response.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:write` and scopes: `datasources:*`, `datasources:id:*` and `datasources:id:1` (single data source).
   * 
   * Please refer to [updated API](#/datasources/updateDataSourceByUID) instead
   */
  'updateDataSourceByID'(
    parameters?: Parameters<Paths.UpdateDataSourceByID.PathParameters> | null,
    data?: Paths.UpdateDataSourceByID.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateDataSourceByID.Responses.$200>
  /**
   * deleteDataSourceByID - Delete an existing data source by id.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:delete` and scopes: `datasources:*`, `datasources:id:*` and `datasources:id:1` (single data source).
   * 
   * Please refer to [updated API](#/datasources/deleteDataSourceByUID) instead
   */
  'deleteDataSourceByID'(
    parameters?: Parameters<Paths.DeleteDataSourceByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteDataSourceByID.Responses.$200>
  /**
   * checkDatasourceHealthByID - Sends a health check request to the plugin datasource identified by the ID.
   * 
   * Please refer to [updated API](#/datasources/checkDatasourceHealthWithUID) instead
   */
  'checkDatasourceHealthByID'(
    parameters?: Parameters<Paths.CheckDatasourceHealthByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CheckDatasourceHealthByID.Responses.$200>
  /**
   * callDatasourceResourceByID - Fetch data source resources by Id.
   * 
   * Please refer to [updated API](#/datasources/callDatasourceResourceWithUID) instead
   */
  'callDatasourceResourceByID'(
    parameters?: Parameters<Paths.CallDatasourceResourceByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CallDatasourceResourceByID.Responses.$200>
  /**
   * queryMetricsWithExpressions - DataSource query metrics with expressions.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `datasources:query`.
   */
  'queryMetricsWithExpressions'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.QueryMetricsWithExpressions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.QueryMetricsWithExpressions.Responses.$200 | Paths.QueryMetricsWithExpressions.Responses.$207>
  /**
   * getFolders - Get all folders.
   * 
   * It returns all folders that the authenticated user has permission to view.
   * If nested folders are enabled, it expects an additional query parameter with the parent folder UID
   * and returns the immediate subfolders that the authenticated user has permission to view.
   * If the parameter is not supplied then it returns immediate subfolders under the root
   * that the authenticated user has permission to view.
   */
  'getFolders'(
    parameters?: Parameters<Paths.GetFolders.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetFolders.Responses.$200>
  /**
   * createFolder - Create folder.
   * 
   * If nested folders are enabled then it additionally expects the parent folder UID.
   */
  'createFolder'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateFolder.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateFolder.Responses.$200>
  /**
   * getFolderByID - Get folder by id.
   * 
   * Returns the folder identified by id. This is deprecated.
   * Please refer to [updated API](#/folders/getFolderByUID) instead
   */
  'getFolderByID'(
    parameters?: Parameters<Paths.GetFolderByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetFolderByID.Responses.$200>
  /**
   * getFolderByUID - Get folder by uid.
   */
  'getFolderByUID'(
    parameters?: Parameters<Paths.GetFolderByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetFolderByUID.Responses.$200>
  /**
   * updateFolder - Update folder.
   */
  'updateFolder'(
    parameters?: Parameters<Paths.UpdateFolder.PathParameters> | null,
    data?: Paths.UpdateFolder.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateFolder.Responses.$200>
  /**
   * deleteFolder - Delete folder.
   * 
   * Deletes an existing folder identified by UID along with all dashboards (and their alerts) stored in the folder. This operation cannot be reverted.
   * If nested folders are enabled then it also deletes all the subfolders.
   */
  'deleteFolder'(
    parameters?: Parameters<Paths.DeleteFolder.QueryParameters & Paths.DeleteFolder.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteFolder.Responses.$200>
  /**
   * getFolderDescendantCounts - Gets the count of each descendant of a folder by kind. The folder is identified by UID.
   */
  'getFolderDescendantCounts'(
    parameters?: Parameters<Paths.GetFolderDescendantCounts.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetFolderDescendantCounts.Responses.$200>
  /**
   * moveFolder - Move folder.
   */
  'moveFolder'(
    parameters?: Parameters<Paths.MoveFolder.PathParameters> | null,
    data?: Paths.MoveFolder.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.MoveFolder.Responses.$200>
  /**
   * getFolderPermissionList - Gets all existing permissions for the folder with the given `uid`.
   */
  'getFolderPermissionList'(
    parameters?: Parameters<Paths.GetFolderPermissionList.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetFolderPermissionList.Responses.$200>
  /**
   * updateFolderPermissions - Updates permissions for a folder. This operation will remove existing permissions if they’re not included in the request.
   */
  'updateFolderPermissions'(
    parameters?: Parameters<Paths.UpdateFolderPermissions.PathParameters> | null,
    data?: Paths.UpdateFolderPermissions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateFolderPermissions.Responses.$200>
  /**
   * getMappedGroups - List groups that have mappings set. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
   */
  'getMappedGroups'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetMappedGroups.Responses.$200>
  /**
   * updateGroupMappings - Update mappings for a group. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
   */
  'updateGroupMappings'(
    parameters?: Parameters<Paths.UpdateGroupMappings.PathParameters> | null,
    data?: Paths.UpdateGroupMappings.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateGroupMappings.Responses.$201>
  /**
   * createGroupMappings - Create mappings for a group. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
   */
  'createGroupMappings'(
    parameters?: Parameters<Paths.CreateGroupMappings.PathParameters> | null,
    data?: Paths.CreateGroupMappings.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateGroupMappings.Responses.$201>
  /**
   * deleteGroupMappings - Delete mappings for a group. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
   */
  'deleteGroupMappings'(
    parameters?: Parameters<Paths.DeleteGroupMappings.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteGroupMappings.Responses.$204>
  /**
   * getGroupRoles - Get roles mapped to a group. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
   */
  'getGroupRoles'(
    parameters?: Parameters<Paths.GetGroupRoles.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetGroupRoles.Responses.$200>
  /**
   * getHealth - apiHealthHandler will return ok if Grafana's web server is running and it
   * can access the database. If the database cannot be accessed it will return
   * http status code 503.
   */
  'getHealth'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetHealth.Responses.$200>
  /**
   * getLibraryElements - Get all library elements.
   * 
   * Returns a list of all library elements the authenticated user has permission to view.
   * Use the `perPage` query parameter to control the maximum number of library elements returned; the default limit is `100`.
   * You can also use the `page` query parameter to fetch library elements from any page other than the first one.
   */
  'getLibraryElements'(
    parameters?: Parameters<Paths.GetLibraryElements.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetLibraryElements.Responses.$200>
  /**
   * createLibraryElement - Create library element.
   * 
   * Creates a new library element.
   */
  'createLibraryElement'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateLibraryElement.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateLibraryElement.Responses.$200>
  /**
   * getLibraryElementByName - Get library element by name.
   * 
   * Returns a library element with the given name.
   */
  'getLibraryElementByName'(
    parameters?: Parameters<Paths.GetLibraryElementByName.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetLibraryElementByName.Responses.$200>
  /**
   * getLibraryElementByUID - Get library element by UID.
   * 
   * Returns a library element with the given UID.
   */
  'getLibraryElementByUID'(
    parameters?: Parameters<Paths.GetLibraryElementByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetLibraryElementByUID.Responses.$200>
  /**
   * updateLibraryElement - Update library element.
   * 
   * Updates an existing library element identified by uid.
   */
  'updateLibraryElement'(
    parameters?: Parameters<Paths.UpdateLibraryElement.PathParameters> | null,
    data?: Paths.UpdateLibraryElement.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateLibraryElement.Responses.$200>
  /**
   * deleteLibraryElementByUID - Delete library element.
   * 
   * Deletes an existing library element as specified by the UID. This operation cannot be reverted.
   * You cannot delete a library element that is connected. This operation cannot be reverted.
   */
  'deleteLibraryElementByUID'(
    parameters?: Parameters<Paths.DeleteLibraryElementByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteLibraryElementByUID.Responses.$200>
  /**
   * getLibraryElementConnections - Get library element connections.
   * 
   * Returns a list of connections for a library element based on the UID specified.
   */
  'getLibraryElementConnections'(
    parameters?: Parameters<Paths.GetLibraryElementConnections.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetLibraryElementConnections.Responses.$200>
  /**
   * getStatus - Check license availability.
   */
  'getStatus'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetStatus.Responses.$200>
  /**
   * getCustomPermissionsReport - Get custom permissions report.
   * 
   * You need to have a permission with action `licensing.reports:read`.
   */
  'getCustomPermissionsReport'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getCustomPermissionsCSV - Get custom permissions report in CSV format.
   * 
   * You need to have a permission with action `licensing.reports:read`.
   */
  'getCustomPermissionsCSV'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * refreshLicenseStats - Refresh license stats.
   * 
   * You need to have a permission with action `licensing:read`.
   */
  'refreshLicenseStats'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RefreshLicenseStats.Responses.$200>
  /**
   * getLicenseToken - Get license token.
   * 
   * You need to have a permission with action `licensing:read`.
   */
  'getLicenseToken'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetLicenseToken.Responses.$200>
  /**
   * postLicenseToken - Create license token.
   * 
   * You need to have a permission with action `licensing:update`.
   */
  'postLicenseToken'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.PostLicenseToken.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PostLicenseToken.Responses.$200>
  /**
   * deleteLicenseToken - Remove license from database.
   * 
   * Removes the license stored in the Grafana database. Available in Grafana Enterprise v7.4+.
   * 
   * You need to have a permission with action `licensing:delete`.
   */
  'deleteLicenseToken'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.DeleteLicenseToken.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteLicenseToken.Responses.$202>
  /**
   * postRenewLicenseToken - Manually force license refresh.
   * 
   * Manually ask license issuer for a new token. Available in Grafana Enterprise v7.4+.
   * 
   * You need to have a permission with action `licensing:update`.
   */
  'postRenewLicenseToken'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.PostRenewLicenseToken.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PostRenewLicenseToken.Responses.$200>
  /**
   * getSAMLLogout - GetLogout initiates single logout process.
   */
  'getSAMLLogout'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getCurrentOrg - Get current Organization.
   */
  'getCurrentOrg'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCurrentOrg.Responses.$200>
  /**
   * updateCurrentOrg - Update current Organization.
   */
  'updateCurrentOrg'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.UpdateCurrentOrg.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateCurrentOrg.Responses.$200>
  /**
   * updateCurrentOrgAddress - Update current Organization's address.
   */
  'updateCurrentOrgAddress'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.UpdateCurrentOrgAddress.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateCurrentOrgAddress.Responses.$200>
  /**
   * getPendingOrgInvites - Get pending invites.
   */
  'getPendingOrgInvites'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetPendingOrgInvites.Responses.$200>
  /**
   * addOrgInvite - Add invite.
   */
  'addOrgInvite'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.AddOrgInvite.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddOrgInvite.Responses.$200>
  /**
   * revokeInvite - Revoke invite.
   */
  'revokeInvite'(
    parameters?: Parameters<Paths.RevokeInvite.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RevokeInvite.Responses.$200>
  /**
   * getOrgPreferences - Get Current Org Prefs.
   */
  'getOrgPreferences'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetOrgPreferences.Responses.$200>
  /**
   * updateOrgPreferences - Update Current Org Prefs.
   */
  'updateOrgPreferences'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.UpdateOrgPreferences.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateOrgPreferences.Responses.$200>
  /**
   * patchOrgPreferences - Patch Current Org Prefs.
   */
  'patchOrgPreferences'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.PatchOrgPreferences.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PatchOrgPreferences.Responses.$200>
  /**
   * getCurrentOrgQuota - Fetch Organization quota.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `orgs.quotas:read` and scope `org:id:1` (orgIDScope).
   */
  'getCurrentOrgQuota'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCurrentOrgQuota.Responses.$200>
  /**
   * getOrgUsersForCurrentOrg - Get all users within the current organization.
   * 
   * Returns all org users within the current organization. Accessible to users with org admin role.
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `org.users:read` with scope `users:*`.
   */
  'getOrgUsersForCurrentOrg'(
    parameters?: Parameters<Paths.GetOrgUsersForCurrentOrg.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetOrgUsersForCurrentOrg.Responses.$200>
  /**
   * addOrgUserToCurrentOrg - Add a new user to the current organization.
   * 
   * Adds a global user to the current organization.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `org.users:add` with scope `users:*`.
   */
  'addOrgUserToCurrentOrg'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.AddOrgUserToCurrentOrg.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddOrgUserToCurrentOrg.Responses.$200>
  /**
   * getOrgUsersForCurrentOrgLookup - Get all users within the current organization (lookup)
   * 
   * Returns all org users within the current organization, but with less detailed information.
   * Accessible to users with org admin role, admin in any folder or admin of any team.
   * Mainly used by Grafana UI for providing list of users when adding team members and when editing folder/dashboard permissions.
   */
  'getOrgUsersForCurrentOrgLookup'(
    parameters?: Parameters<Paths.GetOrgUsersForCurrentOrgLookup.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetOrgUsersForCurrentOrgLookup.Responses.$200>
  /**
   * updateOrgUserForCurrentOrg - Updates the given user.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `org.users.role:update` with scope `users:*`.
   */
  'updateOrgUserForCurrentOrg'(
    parameters?: Parameters<Paths.UpdateOrgUserForCurrentOrg.PathParameters> | null,
    data?: Paths.UpdateOrgUserForCurrentOrg.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateOrgUserForCurrentOrg.Responses.$200>
  /**
   * removeOrgUserForCurrentOrg - Delete user in current organization.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `org.users:remove` with scope `users:*`.
   */
  'removeOrgUserForCurrentOrg'(
    parameters?: Parameters<Paths.RemoveOrgUserForCurrentOrg.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RemoveOrgUserForCurrentOrg.Responses.$200>
  /**
   * searchOrgs - Search all Organizations.
   */
  'searchOrgs'(
    parameters?: Parameters<Paths.SearchOrgs.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchOrgs.Responses.$200>
  /**
   * createOrg - Create Organization.
   * 
   * Only works if [users.allow_org_create](https://grafana.com/docs/grafana/latest/administration/configuration/#allow_org_create) is set.
   */
  'createOrg'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateOrg.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateOrg.Responses.$200>
  /**
   * getOrgByName - Get Organization by ID.
   */
  'getOrgByName'(
    parameters?: Parameters<Paths.GetOrgByName.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetOrgByName.Responses.$200>
  /**
   * getOrgByID - Get Organization by ID.
   */
  'getOrgByID'(
    parameters?: Parameters<Paths.GetOrgByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetOrgByID.Responses.$200>
  /**
   * updateOrg - Update Organization.
   */
  'updateOrg'(
    parameters?: Parameters<Paths.UpdateOrg.PathParameters> | null,
    data?: Paths.UpdateOrg.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateOrg.Responses.$200>
  /**
   * deleteOrgByID - Delete Organization.
   */
  'deleteOrgByID'(
    parameters?: Parameters<Paths.DeleteOrgByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteOrgByID.Responses.$200>
  /**
   * updateOrgAddress - Update Organization's address.
   */
  'updateOrgAddress'(
    parameters?: Parameters<Paths.UpdateOrgAddress.PathParameters> | null,
    data?: Paths.UpdateOrgAddress.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateOrgAddress.Responses.$200>
  /**
   * getOrgQuota - Fetch Organization quota.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `orgs.quotas:read` and scope `org:id:1` (orgIDScope).
   */
  'getOrgQuota'(
    parameters?: Parameters<Paths.GetOrgQuota.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetOrgQuota.Responses.$200>
  /**
   * updateOrgQuota - Update user quota.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `orgs.quotas:write` and scope `org:id:1` (orgIDScope).
   */
  'updateOrgQuota'(
    parameters?: Parameters<Paths.UpdateOrgQuota.PathParameters> | null,
    data?: Paths.UpdateOrgQuota.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateOrgQuota.Responses.$200>
  /**
   * getOrgUsers - Get Users in Organization.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `org.users:read` with scope `users:*`.
   */
  'getOrgUsers'(
    parameters?: Parameters<Paths.GetOrgUsers.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetOrgUsers.Responses.$200>
  /**
   * addOrgUser - Add a new user to the current organization.
   * 
   * Adds a global user to the current organization.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `org.users:add` with scope `users:*`.
   */
  'addOrgUser'(
    parameters?: Parameters<Paths.AddOrgUser.PathParameters> | null,
    data?: Paths.AddOrgUser.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddOrgUser.Responses.$200>
  /**
   * searchOrgUsers - Search Users in Organization.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `org.users:read` with scope `users:*`.
   */
  'searchOrgUsers'(
    parameters?: Parameters<Paths.SearchOrgUsers.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchOrgUsers.Responses.$200>
  /**
   * updateOrgUser - Update Users in Organization.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `org.users.role:update` with scope `users:*`.
   */
  'updateOrgUser'(
    parameters?: Parameters<Paths.UpdateOrgUser.PathParameters> | null,
    data?: Paths.UpdateOrgUser.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateOrgUser.Responses.$200>
  /**
   * removeOrgUser - Delete user in current organization.
   * 
   * If you are running Grafana Enterprise and have Fine-grained access control enabled
   * you need to have a permission with action: `org.users:remove` with scope `users:*`.
   */
  'removeOrgUser'(
    parameters?: Parameters<Paths.RemoveOrgUser.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RemoveOrgUser.Responses.$200>
  /**
   * searchPlaylists - Get playlists.
   */
  'searchPlaylists'(
    parameters?: Parameters<Paths.SearchPlaylists.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchPlaylists.Responses.$200>
  /**
   * createPlaylist - Create playlist.
   */
  'createPlaylist'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreatePlaylist.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreatePlaylist.Responses.$200>
  /**
   * getPlaylist - Get playlist.
   */
  'getPlaylist'(
    parameters?: Parameters<Paths.GetPlaylist.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetPlaylist.Responses.$200>
  /**
   * updatePlaylist - Update playlist.
   */
  'updatePlaylist'(
    parameters?: Parameters<Paths.UpdatePlaylist.PathParameters> | null,
    data?: Paths.UpdatePlaylist.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdatePlaylist.Responses.$200>
  /**
   * deletePlaylist - Delete playlist.
   */
  'deletePlaylist'(
    parameters?: Parameters<Paths.DeletePlaylist.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeletePlaylist.Responses.$200>
  /**
   * getPlaylistItems - Get playlist items.
   */
  'getPlaylistItems'(
    parameters?: Parameters<Paths.GetPlaylistItems.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetPlaylistItems.Responses.$200>
  /**
   * viewPublicDashboard - Get public dashboard for view
   */
  'viewPublicDashboard'(
    parameters?: Parameters<Paths.ViewPublicDashboard.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ViewPublicDashboard.Responses.$200>
  /**
   * getPublicAnnotations - Get annotations for a public dashboard
   */
  'getPublicAnnotations'(
    parameters?: Parameters<Paths.GetPublicAnnotations.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetPublicAnnotations.Responses.$200>
  /**
   * queryPublicDashboard - Get results for a given panel on a public dashboard
   */
  'queryPublicDashboard'(
    parameters?: Parameters<Paths.QueryPublicDashboard.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.QueryPublicDashboard.Responses.$200>
  /**
   * searchQueries - Query history search.
   * 
   * Returns a list of queries in the query history that matches the search criteria.
   * Query history search supports pagination. Use the `limit` parameter to control the maximum number of queries returned; the default limit is 100.
   * You can also use the `page` query parameter to fetch queries from any page other than the first one.
   */
  'searchQueries'(
    parameters?: Parameters<Paths.SearchQueries.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchQueries.Responses.$200>
  /**
   * createQuery - Add query to query history.
   * 
   * Adds new query to query history.
   */
  'createQuery'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateQuery.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateQuery.Responses.$200>
  /**
   * starQuery - Add star to query in query history.
   * 
   * Adds star to query in query history as specified by the UID.
   */
  'starQuery'(
    parameters?: Parameters<Paths.StarQuery.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.StarQuery.Responses.$200>
  /**
   * unstarQuery - Remove star to query in query history.
   * 
   * Removes star from query in query history as specified by the UID.
   */
  'unstarQuery'(
    parameters?: Parameters<Paths.UnstarQuery.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UnstarQuery.Responses.$200>
  /**
   * patchQueryComment - Update comment for query in query history.
   * 
   * Updates comment for query in query history as specified by the UID.
   */
  'patchQueryComment'(
    parameters?: Parameters<Paths.PatchQueryComment.PathParameters> | null,
    data?: Paths.PatchQueryComment.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PatchQueryComment.Responses.$200>
  /**
   * deleteQuery - Delete query in query history.
   * 
   * Deletes an existing query in query history as specified by the UID. This operation cannot be reverted.
   */
  'deleteQuery'(
    parameters?: Parameters<Paths.DeleteQuery.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteQuery.Responses.$200>
  /**
   * listRecordingRules - Lists all rules in the database: active or deleted.
   */
  'listRecordingRules'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListRecordingRules.Responses.$200>
  /**
   * updateRecordingRule - Update the active status of a rule.
   */
  'updateRecordingRule'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.UpdateRecordingRule.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateRecordingRule.Responses.$200>
  /**
   * createRecordingRule - Create a recording rule that is then registered and started.
   */
  'createRecordingRule'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateRecordingRule.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateRecordingRule.Responses.$200>
  /**
   * testCreateRecordingRule - Test a recording rule.
   */
  'testCreateRecordingRule'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.TestCreateRecordingRule.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.TestCreateRecordingRule.Responses.$200>
  /**
   * getRecordingRuleWriteTarget - Return the prometheus remote write target.
   */
  'getRecordingRuleWriteTarget'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetRecordingRuleWriteTarget.Responses.$200>
  /**
   * createRecordingRuleWriteTarget - Create a remote write target.
   * 
   * It returns a 422 if there is not an existing prometheus data source configured.
   */
  'createRecordingRuleWriteTarget'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateRecordingRuleWriteTarget.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateRecordingRuleWriteTarget.Responses.$200>
  /**
   * deleteRecordingRuleWriteTarget - Delete the remote write target.
   */
  'deleteRecordingRuleWriteTarget'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteRecordingRuleWriteTarget.Responses.$200>
  /**
   * deleteRecordingRule - Delete removes the rule from the registry and stops it.
   */
  'deleteRecordingRule'(
    parameters?: Parameters<Paths.DeleteRecordingRule.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteRecordingRule.Responses.$200>
  /**
   * getReports - List reports.
   * 
   * Available to org admins only and with a valid or expired license.
   * 
   * You need to have a permission with action `reports:read` with scope `reports:*`.
   */
  'getReports'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetReports.Responses.$200>
  /**
   * createReport - Create a report.
   * 
   * Available to org admins only and with a valid license.
   * 
   * You need to have a permission with action `reports.admin:create`.
   */
  'createReport'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateReport.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateReport.Responses.$200>
  /**
   * sendReport - Send a report.
   * 
   * Generate and send a report. This API waits for the report to be generated before returning. We recommend that you set the client’s timeout to at least 60 seconds. Available to org admins only and with a valid license.
   * 
   * Only available in Grafana Enterprise v7.0+.
   * This API endpoint is experimental and may be deprecated in a future release. On deprecation, a migration strategy will be provided and the endpoint will remain functional until the next major release of Grafana.
   * 
   * You need to have a permission with action `reports:send`.
   */
  'sendReport'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.SendReport.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SendReport.Responses.$200>
  /**
   * getSettingsImage - Get custom branding report image.
   * 
   * Available to org admins only and with a valid or expired license.
   * 
   * You need to have a permission with action `reports.settings:read`.
   */
  'getSettingsImage'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSettingsImage.Responses.$200>
  /**
   * renderReportCSVs - Download a CSV report.
   * 
   * Available to all users and with a valid license.
   */
  'renderReportCSVs'(
    parameters?: Parameters<Paths.RenderReportCSVs.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RenderReportCSVs.Responses.$200 | Paths.RenderReportCSVs.Responses.$204>
  /**
   * renderReportPDFs - Render report for multiple dashboards.
   * 
   * Available to all users and with a valid license.
   */
  'renderReportPDFs'(
    parameters?: Parameters<Paths.RenderReportPDFs.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RenderReportPDFs.Responses.$200>
  /**
   * getReportSettings - Get report settings.
   * 
   * Available to org admins only and with a valid or expired license.
   * 
   * You need to have a permission with action `reports.settings:read`x.
   */
  'getReportSettings'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetReportSettings.Responses.$200>
  /**
   * saveReportSettings - Save settings.
   * 
   * Available to org admins only and with a valid or expired license.
   * 
   * You need to have a permission with action `reports.settings:write`xx.
   */
  'saveReportSettings'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.SaveReportSettings.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SaveReportSettings.Responses.$200>
  /**
   * sendTestEmail - Send test report via email.
   * 
   * Available to org admins only and with a valid license.
   * 
   * You need to have a permission with action `reports:send`.
   */
  'sendTestEmail'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.SendTestEmail.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SendTestEmail.Responses.$200>
  /**
   * getReport - Get a report.
   * 
   * Available to org admins only and with a valid or expired license.
   * 
   * You need to have a permission with action `reports:read` with scope `reports:id:<report ID>`.
   * 
   * Requesting reports using the internal id will stop workgin in the future
   * Use the reporting apiserver to manage reports.  See: /apis/reporting.grafana.app/
   */
  'getReport'(
    parameters?: Parameters<Paths.GetReport.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetReport.Responses.$200>
  /**
   * updateReport - Update a report.
   * 
   * Available to org admins only and with a valid or expired license.
   * 
   * You need to have a permission with action `reports.admin:write` with scope `reports:id:<report ID>`.
   * 
   * Requesting reports using the internal id will stop workgin in the future
   * Use the reporting apiserver to manage reports.  See: /apis/reporting.grafana.app/
   */
  'updateReport'(
    parameters?: Parameters<Paths.UpdateReport.PathParameters> | null,
    data?: Paths.UpdateReport.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateReport.Responses.$200>
  /**
   * deleteReport - Delete a report.
   * 
   * Available to org admins only and with a valid or expired license.
   * 
   * You need to have a permission with action `reports.delete` with scope `reports:id:<report ID>`.
   * 
   * Requesting reports using the internal id will stop workgin in the future
   * Use the reporting apiserver to manage reports.  See: /apis/reporting.grafana.app/
   */
  'deleteReport'(
    parameters?: Parameters<Paths.DeleteReport.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteReport.Responses.$200>
  /**
   * postACS - It performs Assertion Consumer Service (ACS).
   */
  'postACS'(
    parameters?: Parameters<Paths.PostACS.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getMetadata - It exposes the SP (Grafana's) metadata for the IdP's consumption.
   */
  'getMetadata'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetMetadata.Responses.$200>
  /**
   * getSLO - It performs Single Logout (SLO) callback.
   * 
   * There might be two possible requests:
   * 1. Logout response (callback) when Grafana initiates single logout and IdP returns response to logout request.
   * 2. Logout request when another SP initiates single logout and IdP sends logout request to the Grafana,
   * or in case of IdP-initiated logout.
   */
  'getSLO'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * postSLO - It performs Single Logout (SLO) callback.
   * 
   * There might be two possible requests:
   * 1. Logout response (callback) when Grafana initiates single logout and IdP returns response to logout request.
   * 2. Logout request when another SP initiates single logout and IdP sends logout request to the Grafana,
   * or in case of IdP-initiated logout.
   */
  'postSLO'(
    parameters?: Parameters<Paths.PostSLO.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * search
   */
  'search'(
    parameters?: Parameters<Paths.Search.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.Search.Responses.$200>
  /**
   * SearchDevices - Lists all devices within the last 30 days
   */
  'SearchDevices'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchDevices.Responses.$200>
  /**
   * listSortOptions - List search sorting options.
   */
  'listSortOptions'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListSortOptions.Responses.$200>
  /**
   * createServiceAccount - Create service account
   * 
   * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
   * action: `serviceaccounts:write` scope: `serviceaccounts:*`
   * 
   * Requires basic authentication and that the authenticated user is a Grafana Admin.
   */
  'createServiceAccount'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateServiceAccount.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateServiceAccount.Responses.$201>
  /**
   * searchOrgServiceAccountsWithPaging - Search service accounts with paging
   * 
   * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
   * action: `serviceaccounts:read` scope: `serviceaccounts:*`
   */
  'searchOrgServiceAccountsWithPaging'(
    parameters?: Parameters<Paths.SearchOrgServiceAccountsWithPaging.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchOrgServiceAccountsWithPaging.Responses.$200>
  /**
   * retrieveServiceAccount - Get single serviceaccount by Id
   * 
   * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
   * action: `serviceaccounts:read` scope: `serviceaccounts:id:1` (single service account)
   */
  'retrieveServiceAccount'(
    parameters?: Parameters<Paths.RetrieveServiceAccount.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RetrieveServiceAccount.Responses.$200>
  /**
   * updateServiceAccount - Update service account
   * 
   * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
   * action: `serviceaccounts:write` scope: `serviceaccounts:id:1` (single service account)
   */
  'updateServiceAccount'(
    parameters?: Parameters<Paths.UpdateServiceAccount.PathParameters> | null,
    data?: Paths.UpdateServiceAccount.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateServiceAccount.Responses.$200>
  /**
   * deleteServiceAccount - Delete service account
   * 
   * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
   * action: `serviceaccounts:delete` scope: `serviceaccounts:id:1` (single service account)
   */
  'deleteServiceAccount'(
    parameters?: Parameters<Paths.DeleteServiceAccount.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteServiceAccount.Responses.$200>
  /**
   * listTokens - Get service account tokens
   * 
   * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
   * action: `serviceaccounts:read` scope: `global:serviceaccounts:id:1` (single service account)
   * 
   * Requires basic authentication and that the authenticated user is a Grafana Admin.
   */
  'listTokens'(
    parameters?: Parameters<Paths.ListTokens.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListTokens.Responses.$200>
  /**
   * createToken - CreateNewToken adds a token to a service account
   * 
   * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
   * action: `serviceaccounts:write` scope: `serviceaccounts:id:1` (single service account)
   */
  'createToken'(
    parameters?: Parameters<Paths.CreateToken.PathParameters> | null,
    data?: Paths.CreateToken.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateToken.Responses.$200>
  /**
   * deleteToken - DeleteToken deletes service account tokens
   * 
   * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
   * action: `serviceaccounts:write` scope: `serviceaccounts:id:1` (single service account)
   * 
   * Requires basic authentication and that the authenticated user is a Grafana Admin.
   */
  'deleteToken'(
    parameters?: Parameters<Paths.DeleteToken.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteToken.Responses.$200>
  /**
   * retrieveJWKS - Get JSON Web Key Set (JWKS) with all the keys that can be used to verify tokens (public keys)
   * 
   * Required permissions
   * None
   */
  'retrieveJWKS'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RetrieveJWKS.Responses.$200>
  /**
   * getSharingOptions - Get snapshot sharing settings.
   */
  'getSharingOptions'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSharingOptions.Responses.$200>
  /**
   * createDashboardSnapshot - When creating a snapshot using the API, you have to provide the full dashboard payload including the snapshot data. This endpoint is designed for the Grafana UI.
   * 
   * Snapshot public mode should be enabled or authentication is required.
   */
  'createDashboardSnapshot'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateDashboardSnapshot.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateDashboardSnapshot.Responses.$200>
  /**
   * deleteDashboardSnapshotByDeleteKey - Delete Snapshot by deleteKey.
   * 
   * Snapshot public mode should be enabled or authentication is required.
   */
  'deleteDashboardSnapshotByDeleteKey'(
    parameters?: Parameters<Paths.DeleteDashboardSnapshotByDeleteKey.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteDashboardSnapshotByDeleteKey.Responses.$200>
  /**
   * getDashboardSnapshot - Get Snapshot by Key.
   */
  'getDashboardSnapshot'(
    parameters?: Parameters<Paths.GetDashboardSnapshot.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDashboardSnapshot.Responses.$200>
  /**
   * deleteDashboardSnapshot - Delete Snapshot by Key.
   */
  'deleteDashboardSnapshot'(
    parameters?: Parameters<Paths.DeleteDashboardSnapshot.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteDashboardSnapshot.Responses.$200>
  /**
   * listDevices - Lists all devices within the last 30 days
   */
  'listDevices'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListDevices.Responses.$200>
  /**
   * createTeam - Add Team.
   */
  'createTeam'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateTeam.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateTeam.Responses.$200>
  /**
   * searchTeams - Team Search With Paging.
   */
  'searchTeams'(
    parameters?: Parameters<Paths.SearchTeams.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchTeams.Responses.$200>
  /**
   * getTeamGroupsApi - Get External Groups.
   */
  'getTeamGroupsApi'(
    parameters?: Parameters<Paths.GetTeamGroupsApi.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetTeamGroupsApi.Responses.$200>
  /**
   * addTeamGroupApi - Add External Group.
   */
  'addTeamGroupApi'(
    parameters?: Parameters<Paths.AddTeamGroupApi.PathParameters> | null,
    data?: Paths.AddTeamGroupApi.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddTeamGroupApi.Responses.$200>
  /**
   * removeTeamGroupApiQuery - Remove External Group.
   */
  'removeTeamGroupApiQuery'(
    parameters?: Parameters<Paths.RemoveTeamGroupApiQuery.QueryParameters & Paths.RemoveTeamGroupApiQuery.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RemoveTeamGroupApiQuery.Responses.$200>
  /**
   * getTeamByID - Get Team By ID.
   */
  'getTeamByID'(
    parameters?: Parameters<Paths.GetTeamByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetTeamByID.Responses.$200>
  /**
   * updateTeam - Update Team.
   */
  'updateTeam'(
    parameters?: Parameters<Paths.UpdateTeam.PathParameters> | null,
    data?: Paths.UpdateTeam.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateTeam.Responses.$200>
  /**
   * deleteTeamByID - Delete Team By ID.
   */
  'deleteTeamByID'(
    parameters?: Parameters<Paths.DeleteTeamByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteTeamByID.Responses.$200>
  /**
   * getTeamMembers - Get Team Members.
   */
  'getTeamMembers'(
    parameters?: Parameters<Paths.GetTeamMembers.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetTeamMembers.Responses.$200>
  /**
   * setTeamMemberships - Set team memberships.
   * 
   * Takes user emails, and updates team members and admins to the provided lists of users.
   * Any current team members and admins not in the provided lists will be removed.
   */
  'setTeamMemberships'(
    parameters?: Parameters<Paths.SetTeamMemberships.PathParameters> | null,
    data?: Paths.SetTeamMemberships.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetTeamMemberships.Responses.$200>
  /**
   * addTeamMember - Add Team Member.
   */
  'addTeamMember'(
    parameters?: Parameters<Paths.AddTeamMember.PathParameters> | null,
    data?: Paths.AddTeamMember.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddTeamMember.Responses.$200>
  /**
   * updateTeamMember - Update Team Member.
   */
  'updateTeamMember'(
    parameters?: Parameters<Paths.UpdateTeamMember.PathParameters> | null,
    data?: Paths.UpdateTeamMember.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateTeamMember.Responses.$200>
  /**
   * removeTeamMember - Remove Member From Team.
   */
  'removeTeamMember'(
    parameters?: Parameters<Paths.RemoveTeamMember.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RemoveTeamMember.Responses.$200>
  /**
   * getTeamPreferences - Get Team Preferences.
   */
  'getTeamPreferences'(
    parameters?: Parameters<Paths.GetTeamPreferences.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetTeamPreferences.Responses.$200>
  /**
   * updateTeamPreferences - Update Team Preferences.
   */
  'updateTeamPreferences'(
    parameters?: Parameters<Paths.UpdateTeamPreferences.PathParameters> | null,
    data?: Paths.UpdateTeamPreferences.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateTeamPreferences.Responses.$200>
  /**
   * getSignedInUser - Get (current authenticated user)
   */
  'getSignedInUser'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSignedInUser.Responses.$200>
  /**
   * updateSignedInUser - Update signed in User.
   */
  'updateSignedInUser'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.UpdateSignedInUser.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateSignedInUser.Responses.$200>
  /**
   * getUserAuthTokens - Auth tokens of the actual User.
   * 
   * Return a list of all auth tokens (devices) that the actual user currently have logged in from.
   */
  'getUserAuthTokens'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUserAuthTokens.Responses.$200>
  /**
   * updateUserEmail - Update user email.
   * 
   * Update the email of user given a verification code.
   */
  'updateUserEmail'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * clearHelpFlags - Clear user help flag.
   */
  'clearHelpFlags'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ClearHelpFlags.Responses.$200>
  /**
   * setHelpFlag - Set user help flag.
   */
  'setHelpFlag'(
    parameters?: Parameters<Paths.SetHelpFlag.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetHelpFlag.Responses.$200>
  /**
   * getSignedInUserOrgList - Organizations of the actual User.
   * 
   * Return a list of all organizations of the current user.
   */
  'getSignedInUserOrgList'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSignedInUserOrgList.Responses.$200>
  /**
   * changeUserPassword - Change Password.
   * 
   * Changes the password for the user.
   */
  'changeUserPassword'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.ChangeUserPassword.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ChangeUserPassword.Responses.$200>
  /**
   * getUserPreferences - Get user preferences.
   */
  'getUserPreferences'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUserPreferences.Responses.$200>
  /**
   * updateUserPreferences - Update user preferences.
   * 
   * Omitting a key (`theme`, `homeDashboardId`, `timezone`) will cause the current value to be replaced with the system default value.
   */
  'updateUserPreferences'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.UpdateUserPreferences.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateUserPreferences.Responses.$200>
  /**
   * patchUserPreferences - Patch user preferences.
   */
  'patchUserPreferences'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.PatchUserPreferences.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.PatchUserPreferences.Responses.$200>
  /**
   * getUserQuotas - Fetch user quota.
   */
  'getUserQuotas'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUserQuotas.Responses.$200>
  /**
   * revokeUserAuthToken - Revoke an auth token of the actual User.
   * 
   * Revokes the given auth token (device) for the actual user. User of issued auth token (device) will no longer be logged in and will be required to authenticate again upon next activity.
   */
  'revokeUserAuthToken'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.RevokeUserAuthToken.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RevokeUserAuthToken.Responses.$200>
  /**
   * starDashboardByUID - Star a dashboard.
   * 
   * Stars the given Dashboard for the actual user.
   */
  'starDashboardByUID'(
    parameters?: Parameters<Paths.StarDashboardByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.StarDashboardByUID.Responses.$200>
  /**
   * unstarDashboardByUID - Unstar a dashboard.
   * 
   * Deletes the starring of the given Dashboard for the actual user.
   */
  'unstarDashboardByUID'(
    parameters?: Parameters<Paths.UnstarDashboardByUID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UnstarDashboardByUID.Responses.$200>
  /**
   * starDashboard - Star a dashboard.
   * 
   * Stars the given Dashboard for the actual user.
   */
  'starDashboard'(
    parameters?: Parameters<Paths.StarDashboard.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.StarDashboard.Responses.$200>
  /**
   * unstarDashboard - Unstar a dashboard.
   * 
   * Deletes the starring of the given Dashboard for the actual user.
   */
  'unstarDashboard'(
    parameters?: Parameters<Paths.UnstarDashboard.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UnstarDashboard.Responses.$200>
  /**
   * getSignedInUserTeamList - Teams that the actual User is member of.
   * 
   * Return a list of all teams that the current user is member of.
   */
  'getSignedInUserTeamList'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSignedInUserTeamList.Responses.$200>
  /**
   * userSetUsingOrg - Switch user context for signed in user.
   * 
   * Switch user context to the given organization.
   */
  'userSetUsingOrg'(
    parameters?: Parameters<Paths.UserSetUsingOrg.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UserSetUsingOrg.Responses.$200>
  /**
   * searchUsers - Get users.
   * 
   * Returns all users that the authenticated user has permission to view, admin permission required.
   */
  'searchUsers'(
    parameters?: Parameters<Paths.SearchUsers.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchUsers.Responses.$200>
  /**
   * getUserByLoginOrEmail - Get user by login or email.
   */
  'getUserByLoginOrEmail'(
    parameters?: Parameters<Paths.GetUserByLoginOrEmail.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUserByLoginOrEmail.Responses.$200>
  /**
   * searchUsersWithPaging - Get users with paging.
   */
  'searchUsersWithPaging'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SearchUsersWithPaging.Responses.$200>
  /**
   * getUserByID - Get user by id.
   */
  'getUserByID'(
    parameters?: Parameters<Paths.GetUserByID.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUserByID.Responses.$200>
  /**
   * updateUser - Update user.
   * 
   * Update the user identified by id.
   */
  'updateUser'(
    parameters?: Parameters<Paths.UpdateUser.PathParameters> | null,
    data?: Paths.UpdateUser.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateUser.Responses.$200>
  /**
   * getUserOrgList - Get organizations for user.
   * 
   * Get organizations for user identified by id.
   */
  'getUserOrgList'(
    parameters?: Parameters<Paths.GetUserOrgList.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUserOrgList.Responses.$200>
  /**
   * getUserTeams - Get teams for user.
   * 
   * Get teams for user identified by id.
   */
  'getUserTeams'(
    parameters?: Parameters<Paths.GetUserTeams.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUserTeams.Responses.$200>
  /**
   * RouteGetAlertRules - Get all the alert rules.
   */
  'RouteGetAlertRules'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetAlertRules.Responses.$200>
  /**
   * RoutePostAlertRule - Create a new alert rule.
   */
  'RoutePostAlertRule'(
    parameters?: Parameters<Paths.RoutePostAlertRule.HeaderParameters> | null,
    data?: Paths.RoutePostAlertRule.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RoutePostAlertRule.Responses.$201>
  /**
   * RouteGetAlertRulesExport - Export all alert rules in provisioning file format.
   */
  'RouteGetAlertRulesExport'(
    parameters?: Parameters<Paths.RouteGetAlertRulesExport.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetAlertRulesExport.Responses.$200>
  /**
   * RouteGetAlertRule - Get a specific alert rule by UID.
   */
  'RouteGetAlertRule'(
    parameters?: Parameters<Paths.RouteGetAlertRule.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetAlertRule.Responses.$200>
  /**
   * RoutePutAlertRule - Update an existing alert rule.
   */
  'RoutePutAlertRule'(
    parameters?: Parameters<Paths.RoutePutAlertRule.HeaderParameters & Paths.RoutePutAlertRule.PathParameters> | null,
    data?: Paths.RoutePutAlertRule.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RoutePutAlertRule.Responses.$200>
  /**
   * RouteDeleteAlertRule - Delete a specific alert rule by UID.
   */
  'RouteDeleteAlertRule'(
    parameters?: Parameters<Paths.RouteDeleteAlertRule.HeaderParameters & Paths.RouteDeleteAlertRule.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteDeleteAlertRule.Responses.$204>
  /**
   * RouteGetAlertRuleExport - Export an alert rule in provisioning file format.
   */
  'RouteGetAlertRuleExport'(
    parameters?: Parameters<Paths.RouteGetAlertRuleExport.QueryParameters & Paths.RouteGetAlertRuleExport.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetAlertRuleExport.Responses.$200>
  /**
   * RouteGetContactpoints - Get all the contact points.
   */
  'RouteGetContactpoints'(
    parameters?: Parameters<Paths.RouteGetContactpoints.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetContactpoints.Responses.$200>
  /**
   * RoutePostContactpoints - Create a contact point.
   */
  'RoutePostContactpoints'(
    parameters?: Parameters<Paths.RoutePostContactpoints.HeaderParameters> | null,
    data?: Paths.RoutePostContactpoints.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RoutePostContactpoints.Responses.$202>
  /**
   * RouteGetContactpointsExport - Export all contact points in provisioning file format.
   */
  'RouteGetContactpointsExport'(
    parameters?: Parameters<Paths.RouteGetContactpointsExport.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetContactpointsExport.Responses.$200>
  /**
   * RoutePutContactpoint - Update an existing contact point.
   */
  'RoutePutContactpoint'(
    parameters?: Parameters<Paths.RoutePutContactpoint.HeaderParameters & Paths.RoutePutContactpoint.PathParameters> | null,
    data?: Paths.RoutePutContactpoint.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RoutePutContactpoint.Responses.$202>
  /**
   * RouteDeleteContactpoints - Delete a contact point.
   */
  'RouteDeleteContactpoints'(
    parameters?: Parameters<Paths.RouteDeleteContactpoints.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteDeleteContactpoints.Responses.$202>
  /**
   * RouteGetAlertRuleGroup - Get a rule group.
   */
  'RouteGetAlertRuleGroup'(
    parameters?: Parameters<Paths.RouteGetAlertRuleGroup.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetAlertRuleGroup.Responses.$200>
  /**
   * RoutePutAlertRuleGroup - Create or update alert rule group.
   */
  'RoutePutAlertRuleGroup'(
    parameters?: Parameters<Paths.RoutePutAlertRuleGroup.HeaderParameters & Paths.RoutePutAlertRuleGroup.PathParameters> | null,
    data?: Paths.RoutePutAlertRuleGroup.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RoutePutAlertRuleGroup.Responses.$200>
  /**
   * RouteDeleteAlertRuleGroup - Delete rule group
   */
  'RouteDeleteAlertRuleGroup'(
    parameters?: Parameters<Paths.RouteDeleteAlertRuleGroup.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteDeleteAlertRuleGroup.Responses.$204>
  /**
   * RouteGetAlertRuleGroupExport - Export an alert rule group in provisioning file format.
   */
  'RouteGetAlertRuleGroupExport'(
    parameters?: Parameters<Paths.RouteGetAlertRuleGroupExport.QueryParameters & Paths.RouteGetAlertRuleGroupExport.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetAlertRuleGroupExport.Responses.$200>
  /**
   * RouteGetMuteTimings - Get all the mute timings.
   */
  'RouteGetMuteTimings'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetMuteTimings.Responses.$200>
  /**
   * RoutePostMuteTiming - Create a new mute timing.
   */
  'RoutePostMuteTiming'(
    parameters?: Parameters<Paths.RoutePostMuteTiming.HeaderParameters> | null,
    data?: Paths.RoutePostMuteTiming.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RoutePostMuteTiming.Responses.$201>
  /**
   * RouteExportMuteTimings - Export all mute timings in provisioning format.
   */
  'RouteExportMuteTimings'(
    parameters?: Parameters<Paths.RouteExportMuteTimings.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteExportMuteTimings.Responses.$200>
  /**
   * RouteGetMuteTiming - Get a mute timing.
   */
  'RouteGetMuteTiming'(
    parameters?: Parameters<Paths.RouteGetMuteTiming.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetMuteTiming.Responses.$200>
  /**
   * RoutePutMuteTiming - Replace an existing mute timing.
   */
  'RoutePutMuteTiming'(
    parameters?: Parameters<Paths.RoutePutMuteTiming.HeaderParameters & Paths.RoutePutMuteTiming.PathParameters> | null,
    data?: Paths.RoutePutMuteTiming.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RoutePutMuteTiming.Responses.$202>
  /**
   * RouteDeleteMuteTiming - Delete a mute timing.
   */
  'RouteDeleteMuteTiming'(
    parameters?: Parameters<Paths.RouteDeleteMuteTiming.QueryParameters & Paths.RouteDeleteMuteTiming.HeaderParameters & Paths.RouteDeleteMuteTiming.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteDeleteMuteTiming.Responses.$204>
  /**
   * RouteExportMuteTiming - Export a mute timing in provisioning format.
   */
  'RouteExportMuteTiming'(
    parameters?: Parameters<Paths.RouteExportMuteTiming.QueryParameters & Paths.RouteExportMuteTiming.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteExportMuteTiming.Responses.$200>
  /**
   * RouteGetPolicyTree - Get the notification policy tree.
   */
  'RouteGetPolicyTree'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetPolicyTree.Responses.$200>
  /**
   * RoutePutPolicyTree - Sets the notification policy tree.
   */
  'RoutePutPolicyTree'(
    parameters?: Parameters<Paths.RoutePutPolicyTree.HeaderParameters> | null,
    data?: Paths.RoutePutPolicyTree.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RoutePutPolicyTree.Responses.$202>
  /**
   * RouteResetPolicyTree - Clears the notification policy tree.
   */
  'RouteResetPolicyTree'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteResetPolicyTree.Responses.$202>
  /**
   * RouteGetPolicyTreeExport - Export the notification policy tree in provisioning file format.
   */
  'RouteGetPolicyTreeExport'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetPolicyTreeExport.Responses.$200>
  /**
   * RouteGetTemplates - Get all notification template groups.
   */
  'RouteGetTemplates'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetTemplates.Responses.$200>
  /**
   * RouteGetTemplate - Get a notification template group.
   */
  'RouteGetTemplate'(
    parameters?: Parameters<Paths.RouteGetTemplate.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteGetTemplate.Responses.$200>
  /**
   * RoutePutTemplate - Updates an existing notification template group.
   */
  'RoutePutTemplate'(
    parameters?: Parameters<Paths.RoutePutTemplate.HeaderParameters & Paths.RoutePutTemplate.PathParameters> | null,
    data?: Paths.RoutePutTemplate.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RoutePutTemplate.Responses.$202>
  /**
   * RouteDeleteTemplate - Delete a notification template group.
   */
  'RouteDeleteTemplate'(
    parameters?: Parameters<Paths.RouteDeleteTemplate.QueryParameters & Paths.RouteDeleteTemplate.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RouteDeleteTemplate.Responses.$204>
  /**
   * listAllProvidersSettings - List all SSO Settings entries
   * 
   * You need to have a permission with action `settings:read` with scope `settings:auth.<provider>:*`.
   */
  'listAllProvidersSettings'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListAllProvidersSettings.Responses.$200>
  /**
   * getProviderSettings - Get an SSO Settings entry by Key
   * 
   * You need to have a permission with action `settings:read` with scope `settings:auth.<provider>:*`.
   */
  'getProviderSettings'(
    parameters?: Parameters<Paths.GetProviderSettings.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetProviderSettings.Responses.$200>
  /**
   * updateProviderSettings - Update SSO Settings
   * 
   * Inserts or updates the SSO Settings for a provider.
   * 
   * You need to have a permission with action `settings:write` and scope `settings:auth.<provider>:*`.
   */
  'updateProviderSettings'(
    parameters?: Parameters<Paths.UpdateProviderSettings.PathParameters> | null,
    data?: Paths.UpdateProviderSettings.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateProviderSettings.Responses.$204>
  /**
   * removeProviderSettings - Remove SSO Settings
   * 
   * Removes the SSO Settings for a provider.
   * 
   * You need to have a permission with action `settings:write` and scope `settings:auth.<provider>:*`.
   */
  'removeProviderSettings'(
    parameters?: Parameters<Paths.RemoveProviderSettings.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.RemoveProviderSettings.Responses.$204>
}

export interface PathsDictionary {
  ['/access-control/assignments/search']: {
    /**
     * searchResult - Debug permissions.
     * 
     * Returns the result of the search through access-control role assignments.
     * 
     * You need to have a permission with action `teams.roles:read` on scope `teams:*`
     * and a permission with action `users.roles:read` on scope `users:*`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchResult.Responses.$200>
  }
  ['/access-control/roles']: {
    /**
     * listRoles - Get all roles.
     * 
     * Gets all existing roles. The response contains all global and organization local roles, for the organization which user is signed in.
     * 
     * You need to have a permission with action `roles:read` and scope `roles:*`.
     * 
     * The `delegatable` flag reduces the set of roles to only those for which the signed-in user has permissions to assign.
     */
    'get'(
      parameters?: Parameters<Paths.ListRoles.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListRoles.Responses.$200>
    /**
     * createRole - Create a new custom role.
     * 
     * Creates a new custom role and maps given permissions to that role. Note that roles with the same prefix as Fixed Roles can’t be created.
     * 
     * You need to have a permission with action `roles:write` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only create custom roles with the same, or a subset of permissions which the user has.
     * For example, if a user does not have required permissions for creating users, they won’t be able to create a custom role which allows to do that. This is done to prevent escalation of privileges.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateRole.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateRole.Responses.$201>
  }
  ['/access-control/roles/{roleUID}']: {
    /**
     * deleteRole - Delete a custom role.
     * 
     * Delete a role with the given UID, and it’s permissions. If the role is assigned to a built-in role, the deletion operation will fail, unless force query param is set to true, and in that case all assignments will also be deleted.
     * 
     * You need to have a permission with action `roles:delete` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only delete a custom role with the same, or a subset of permissions which the user has. For example, if a user does not have required permissions for creating users, they won’t be able to delete a custom role which allows to do that.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteRole.QueryParameters & Paths.DeleteRole.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteRole.Responses.$200>
    /**
     * getRole - Get a role.
     * 
     * Get a role for the given UID.
     * 
     * You need to have a permission with action `roles:read` and scope `roles:*`.
     */
    'get'(
      parameters?: Parameters<Paths.GetRole.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetRole.Responses.$200>
    /**
     * updateRole - Update a custom role.
     * 
     * You need to have a permission with action `roles:write` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only create custom roles with the same, or a subset of permissions which the user has.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateRole.PathParameters> | null,
      data?: Paths.UpdateRole.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateRole.Responses.$200>
  }
  ['/access-control/roles/{roleUID}/assignments']: {
    /**
     * getRoleAssignments - Get role assignments.
     * 
     * Get role assignments for the role with the given UID.
     * Does not include role assignments mapped through group attribute sync.
     * 
     * You need to have a permission with action `teams.roles:list` and scope `teams:id:*` and `users.roles:list` and scope `users:id:*`.
     */
    'get'(
      parameters?: Parameters<Paths.GetRoleAssignments.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetRoleAssignments.Responses.$200>
    /**
     * setRoleAssignments - Set role assignments.
     * 
     * Set role assignments for the role with the given UID.
     * 
     * You need to have a permission with action `teams.roles:add` and `teams.roles:remove` and scope `permissions:type:delegate`, and `users.roles:add` and `users.roles:remove` and scope `permissions:type:delegate`.
     */
    'put'(
      parameters?: Parameters<Paths.SetRoleAssignments.PathParameters> | null,
      data?: Paths.SetRoleAssignments.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetRoleAssignments.Responses.$200>
  }
  ['/access-control/status']: {
    /**
     * getAccessControlStatus - Get status.
     * 
     * Returns an indicator to check if fine-grained access control is enabled or not.
     * 
     * You need to have a permission with action `status:accesscontrol` and scope `services:accesscontrol`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetAccessControlStatus.Responses.$200>
  }
  ['/access-control/teams/roles/search']: {
    /**
     * listTeamsRoles - List roles assigned to multiple teams.
     * 
     * Lists the roles that have been directly assigned to the given teams.
     * 
     * You need to have a permission with action `teams.roles:read` and scope `teams:id:*`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.ListTeamsRoles.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListTeamsRoles.Responses.$200>
  }
  ['/access-control/teams/{teamId}/roles']: {
    /**
     * listTeamRoles - Get team roles.
     * 
     * You need to have a permission with action `teams.roles:read` and scope `teams:id:<team ID>`.
     */
    'get'(
      parameters?: Parameters<Paths.ListTeamRoles.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListTeamRoles.Responses.$200>
    /**
     * addTeamRole - Add team role.
     * 
     * You need to have a permission with action `teams.roles:add` and scope `permissions:type:delegate`.
     */
    'post'(
      parameters?: Parameters<Paths.AddTeamRole.PathParameters> | null,
      data?: Paths.AddTeamRole.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddTeamRole.Responses.$200>
    /**
     * setTeamRoles - Update team role.
     * 
     * You need to have a permission with action `teams.roles:add` and `teams.roles:remove` and scope `permissions:type:delegate` for each.
     */
    'put'(
      parameters?: Parameters<Paths.SetTeamRoles.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetTeamRoles.Responses.$200>
  }
  ['/access-control/teams/{teamId}/roles/{roleUID}']: {
    /**
     * removeTeamRole - Remove team role.
     * 
     * You need to have a permission with action `teams.roles:remove` and scope `permissions:type:delegate`.
     */
    'delete'(
      parameters?: Parameters<Paths.RemoveTeamRole.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RemoveTeamRole.Responses.$200>
  }
  ['/access-control/users/roles/search']: {
    /**
     * listUsersRoles - List roles assigned to multiple users.
     * 
     * Lists the roles that have been directly assigned to the given users. The list does not include built-in roles (Viewer, Editor, Admin or Grafana Admin), and it does not include roles that have been inherited from a team.
     * 
     * You need to have a permission with action `users.roles:read` and scope `users:id:*`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.ListUsersRoles.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListUsersRoles.Responses.$200>
  }
  ['/access-control/users/{userId}/roles']: {
    /**
     * listUserRoles - List roles assigned to a user.
     * 
     * Lists the roles that have been directly assigned to a given user. The list does not include built-in roles (Viewer, Editor, Admin or Grafana Admin), and it does not include roles that have been inherited from a team.
     * 
     * You need to have a permission with action `users.roles:read` and scope `users:id:<user ID>`.
     */
    'get'(
      parameters?: Parameters<Paths.ListUserRoles.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListUserRoles.Responses.$200>
    /**
     * addUserRole - Add a user role assignment.
     * 
     * Assign a role to a specific user. For bulk updates consider Set user role assignments.
     * 
     * You need to have a permission with action `users.roles:add` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only assign roles which have same, or a subset of permissions which the user has. For example, if a user does not have required permissions for creating users, they won’t be able to assign a role which will allow to do that. This is done to prevent escalation of privileges.
     */
    'post'(
      parameters?: Parameters<Paths.AddUserRole.PathParameters> | null,
      data?: Paths.AddUserRole.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddUserRole.Responses.$200>
    /**
     * setUserRoles - Set user role assignments.
     * 
     * Update the user’s role assignments to match the provided set of UIDs. This will remove any assigned roles that aren’t in the request and add roles that are in the set but are not already assigned to the user.
     * Roles mapped through group attribute sync are not impacted.
     * If you want to add or remove a single role, consider using Add a user role assignment or Remove a user role assignment instead.
     * 
     * You need to have a permission with action `users.roles:add` and `users.roles:remove` and scope `permissions:type:delegate` for each. `permissions:type:delegate`  scope ensures that users can only assign or unassign roles which have same, or a subset of permissions which the user has. For example, if a user does not have required permissions for creating users, they won’t be able to assign or unassign a role which will allow to do that. This is done to prevent escalation of privileges.
     */
    'put'(
      parameters?: Parameters<Paths.SetUserRoles.PathParameters> | null,
      data?: Paths.SetUserRoles.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetUserRoles.Responses.$200>
  }
  ['/access-control/users/{userId}/roles/{roleUID}']: {
    /**
     * removeUserRole - Remove a user role assignment.
     * 
     * Revoke a role from a user. For bulk updates consider Set user role assignments.
     * 
     * You need to have a permission with action `users.roles:remove` and scope `permissions:type:delegate`. `permissions:type:delegate` scope ensures that users can only unassign roles which have same, or a subset of permissions which the user has. For example, if a user does not have required permissions for creating users, they won’t be able to unassign a role which will allow to do that. This is done to prevent escalation of privileges.
     */
    'delete'(
      parameters?: Parameters<Paths.RemoveUserRole.QueryParameters & Paths.RemoveUserRole.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RemoveUserRole.Responses.$200>
  }
  ['/access-control/{resource}/description']: {
    /**
     * getResourceDescription - Get a description of a resource's access control properties.
     */
    'get'(
      parameters?: Parameters<Paths.GetResourceDescription.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetResourceDescription.Responses.$200>
  }
  ['/access-control/{resource}/{resourceID}']: {
    /**
     * getResourcePermissions - Get permissions for a resource.
     */
    'get'(
      parameters?: Parameters<Paths.GetResourcePermissions.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetResourcePermissions.Responses.$200>
    /**
     * setResourcePermissions - Set resource permissions.
     * 
     * Assigns permissions for a resource by a given type (`:resource`) and `:resourceID` to one or many
     * assignment types. Allowed resources are `datasources`, `teams`, `dashboards`, `folders`, and `serviceaccounts`.
     * Refer to the `/access-control/{resource}/description` endpoint for allowed Permissions.
     */
    'post'(
      parameters?: Parameters<Paths.SetResourcePermissions.PathParameters> | null,
      data?: Paths.SetResourcePermissions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetResourcePermissions.Responses.$200>
  }
  ['/access-control/{resource}/{resourceID}/builtInRoles/{builtInRole}']: {
    /**
     * setResourcePermissionsForBuiltInRole - Set resource permissions for a built-in role.
     * 
     * Assigns permissions for a resource by a given type (`:resource`) and `:resourceID` to a built-in role.
     * Allowed resources are `datasources`, `teams`, `dashboards`, `folders`, and `serviceaccounts`.
     * Refer to the `/access-control/{resource}/description` endpoint for allowed Permissions.
     */
    'post'(
      parameters?: Parameters<Paths.SetResourcePermissionsForBuiltInRole.PathParameters> | null,
      data?: Paths.SetResourcePermissionsForBuiltInRole.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetResourcePermissionsForBuiltInRole.Responses.$200>
  }
  ['/access-control/{resource}/{resourceID}/teams/{teamID}']: {
    /**
     * setResourcePermissionsForTeam - Set resource permissions for a team.
     * 
     * Assigns permissions for a resource by a given type (`:resource`) and `:resourceID` to a team.
     * Allowed resources are `datasources`, `teams`, `dashboards`, `folders`, and `serviceaccounts`.
     * Refer to the `/access-control/{resource}/description` endpoint for allowed Permissions.
     */
    'post'(
      parameters?: Parameters<Paths.SetResourcePermissionsForTeam.PathParameters> | null,
      data?: Paths.SetResourcePermissionsForTeam.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetResourcePermissionsForTeam.Responses.$200>
  }
  ['/access-control/{resource}/{resourceID}/users/{userID}']: {
    /**
     * setResourcePermissionsForUser - Set resource permissions for a user.
     * 
     * Assigns permissions for a resource by a given type (`:resource`) and `:resourceID` to a user or a service account.
     * Allowed resources are `datasources`, `teams`, `dashboards`, `folders`, and `serviceaccounts`.
     * Refer to the `/access-control/{resource}/description` endpoint for allowed Permissions.
     */
    'post'(
      parameters?: Parameters<Paths.SetResourcePermissionsForUser.PathParameters> | null,
      data?: Paths.SetResourcePermissionsForUser.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetResourcePermissionsForUser.Responses.$200>
  }
  ['/admin/ldap-sync-status']: {
    /**
     * getSyncStatus - Returns the current state of the LDAP background sync integration.
     * 
     * You need to have a permission with action `ldap.status:read`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSyncStatus.Responses.$200>
  }
  ['/admin/ldap/reload']: {
    /**
     * reloadLDAPCfg - Reloads the LDAP configuration.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `ldap.config:reload`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ReloadLDAPCfg.Responses.$200>
  }
  ['/admin/ldap/status']: {
    /**
     * getLDAPStatus - Attempts to connect to all the configured LDAP servers and returns information on whenever they're available or not.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `ldap.status:read`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetLDAPStatus.Responses.$200>
  }
  ['/admin/ldap/sync/{user_id}']: {
    /**
     * postSyncUserWithLDAP - Enables a single Grafana user to be synchronized against LDAP.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `ldap.user:sync`.
     */
    'post'(
      parameters?: Parameters<Paths.PostSyncUserWithLDAP.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PostSyncUserWithLDAP.Responses.$200>
  }
  ['/admin/ldap/{user_name}']: {
    /**
     * getUserFromLDAP - Finds an user based on a username in LDAP. This helps illustrate how would the particular user be mapped in Grafana when synced.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `ldap.user:read`.
     */
    'get'(
      parameters?: Parameters<Paths.GetUserFromLDAP.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUserFromLDAP.Responses.$200>
  }
  ['/admin/provisioning/access-control/reload']: {
    /**
     * adminProvisioningReloadAccessControl - You need to have a permission with action `provisioning:reload` with scope `provisioners:accesscontrol`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminProvisioningReloadAccessControl.Responses.$202>
  }
  ['/admin/provisioning/dashboards/reload']: {
    /**
     * adminProvisioningReloadDashboards - Reload dashboard provisioning configurations.
     * 
     * Reloads the provisioning config files for dashboards again. It won’t return until the new provisioned entities are already stored in the database. In case of dashboards, it will stop polling for changes in dashboard files and then restart it with new configurations after returning.
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `provisioning:reload` and scope `provisioners:dashboards`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminProvisioningReloadDashboards.Responses.$200>
  }
  ['/admin/provisioning/datasources/reload']: {
    /**
     * adminProvisioningReloadDatasources - Reload datasource provisioning configurations.
     * 
     * Reloads the provisioning config files for datasources again. It won’t return until the new provisioned entities are already stored in the database. In case of dashboards, it will stop polling for changes in dashboard files and then restart it with new configurations after returning.
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `provisioning:reload` and scope `provisioners:datasources`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminProvisioningReloadDatasources.Responses.$200>
  }
  ['/admin/provisioning/plugins/reload']: {
    /**
     * adminProvisioningReloadPlugins - Reload plugin provisioning configurations.
     * 
     * Reloads the provisioning config files for plugins again. It won’t return until the new provisioned entities are already stored in the database. In case of dashboards, it will stop polling for changes in dashboard files and then restart it with new configurations after returning.
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `provisioning:reload` and scope `provisioners:plugin`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminProvisioningReloadPlugins.Responses.$200>
  }
  ['/admin/settings']: {
    /**
     * adminGetSettings - Fetch settings.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `settings:read` and scopes: `settings:*`, `settings:auth.saml:` and `settings:auth.saml:enabled` (property level).
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminGetSettings.Responses.$200>
  }
  ['/admin/stats']: {
    /**
     * adminGetStats - Fetch Grafana Stats.
     * 
     * Only works with Basic Authentication (username and password). See introduction for an explanation.
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `server:stats:read`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminGetStats.Responses.$200>
  }
  ['/admin/users']: {
    /**
     * adminCreateUser - Create new user.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users:create`.
     * Note that OrgId is an optional parameter that can be used to assign a new user to a different organization when `auto_assign_org` is set to `true`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.AdminCreateUser.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminCreateUser.Responses.$200>
  }
  ['/admin/users/{user_id}']: {
    /**
     * adminDeleteUser - Delete global User.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users:delete` and scope `global.users:*`.
     */
    'delete'(
      parameters?: Parameters<Paths.AdminDeleteUser.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminDeleteUser.Responses.$200>
  }
  ['/admin/users/{user_id}/auth-tokens']: {
    /**
     * adminGetUserAuthTokens - Return a list of all auth tokens (devices) that the user currently have logged in from.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.authtoken:list` and scope `global.users:*`.
     */
    'get'(
      parameters?: Parameters<Paths.AdminGetUserAuthTokens.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminGetUserAuthTokens.Responses.$200>
  }
  ['/admin/users/{user_id}/disable']: {
    /**
     * adminDisableUser - Disable user.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users:disable` and scope `global.users:1` (userIDScope).
     */
    'post'(
      parameters?: Parameters<Paths.AdminDisableUser.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminDisableUser.Responses.$200>
  }
  ['/admin/users/{user_id}/enable']: {
    /**
     * adminEnableUser - Enable user.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users:enable` and scope `global.users:1` (userIDScope).
     */
    'post'(
      parameters?: Parameters<Paths.AdminEnableUser.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminEnableUser.Responses.$200>
  }
  ['/admin/users/{user_id}/logout']: {
    /**
     * adminLogoutUser - Logout user revokes all auth tokens (devices) for the user. User of issued auth tokens (devices) will no longer be logged in and will be required to authenticate again upon next activity.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.logout` and scope `global.users:*`.
     */
    'post'(
      parameters?: Parameters<Paths.AdminLogoutUser.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminLogoutUser.Responses.$200>
  }
  ['/admin/users/{user_id}/password']: {
    /**
     * adminUpdateUserPassword - Set password for user.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.password:update` and scope `global.users:*`.
     */
    'put'(
      parameters?: Parameters<Paths.AdminUpdateUserPassword.PathParameters> | null,
      data?: Paths.AdminUpdateUserPassword.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminUpdateUserPassword.Responses.$200>
  }
  ['/admin/users/{user_id}/permissions']: {
    /**
     * adminUpdateUserPermissions - Set permissions for user.
     * 
     * Only works with Basic Authentication (username and password). See introduction for an explanation.
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.permissions:update` and scope `global.users:*`.
     */
    'put'(
      parameters?: Parameters<Paths.AdminUpdateUserPermissions.PathParameters> | null,
      data?: Paths.AdminUpdateUserPermissions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminUpdateUserPermissions.Responses.$200>
  }
  ['/admin/users/{user_id}/quotas']: {
    /**
     * getUserQuota - Fetch user quota.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.quotas:list` and scope `global.users:1` (userIDScope).
     */
    'get'(
      parameters?: Parameters<Paths.GetUserQuota.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUserQuota.Responses.$200>
  }
  ['/admin/users/{user_id}/quotas/{quota_target}']: {
    /**
     * updateUserQuota - Update user quota.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.quotas:update` and scope `global.users:1` (userIDScope).
     */
    'put'(
      parameters?: Parameters<Paths.UpdateUserQuota.PathParameters> | null,
      data?: Paths.UpdateUserQuota.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateUserQuota.Responses.$200>
  }
  ['/admin/users/{user_id}/revoke-auth-token']: {
    /**
     * adminRevokeUserAuthToken - Revoke auth token for user.
     * 
     * Revokes the given auth token (device) for the user. User of issued auth token (device) will no longer be logged in and will be required to authenticate again upon next activity.
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `users.authtoken:update` and scope `global.users:*`.
     */
    'post'(
      parameters?: Parameters<Paths.AdminRevokeUserAuthToken.PathParameters> | null,
      data?: Paths.AdminRevokeUserAuthToken.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AdminRevokeUserAuthToken.Responses.$200>
  }
  ['/annotations']: {
    /**
     * getAnnotations - Find Annotations.
     * 
     * Starting in Grafana v6.4 regions annotations are now returned in one entity that now includes the timeEnd property.
     */
    'get'(
      parameters?: Parameters<Paths.GetAnnotations.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetAnnotations.Responses.$200>
    /**
     * postAnnotation - Create Annotation.
     * 
     * Creates an annotation in the Grafana database. The dashboardId and panelId fields are optional. If they are not specified then an organization annotation is created and can be queried in any dashboard that adds the Grafana annotations data source. When creating a region annotation include the timeEnd property.
     * The format for `time` and `timeEnd` should be epoch numbers in millisecond resolution.
     * The response for this HTTP request is slightly different in versions prior to v6.4. In prior versions you would also get an endId if you where creating a region. But in 6.4 regions are represented using a single event with time and timeEnd properties.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.PostAnnotation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PostAnnotation.Responses.$200>
  }
  ['/annotations/graphite']: {
    /**
     * postGraphiteAnnotation - Create Annotation in Graphite format.
     * 
     * Creates an annotation by using Graphite-compatible event format. The `when` and `data` fields are optional. If `when` is not specified then the current time will be used as annotation’s timestamp. The `tags` field can also be in prior to Graphite `0.10.0` format (string with multiple tags being separated by a space).
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.PostGraphiteAnnotation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PostGraphiteAnnotation.Responses.$200>
  }
  ['/annotations/mass-delete']: {
    /**
     * massDeleteAnnotations - Delete multiple annotations.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.MassDeleteAnnotations.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.MassDeleteAnnotations.Responses.$200>
  }
  ['/annotations/tags']: {
    /**
     * getAnnotationTags - Find Annotations Tags.
     * 
     * Find all the event tags created in the annotations.
     */
    'get'(
      parameters?: Parameters<Paths.GetAnnotationTags.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetAnnotationTags.Responses.$200>
  }
  ['/annotations/{annotation_id}']: {
    /**
     * deleteAnnotationByID - Delete Annotation By ID.
     * 
     * Deletes the annotation that matches the specified ID.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteAnnotationByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteAnnotationByID.Responses.$200>
    /**
     * getAnnotationByID - Get Annotation by ID.
     */
    'get'(
      parameters?: Parameters<Paths.GetAnnotationByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetAnnotationByID.Responses.$200>
    /**
     * patchAnnotation - Patch Annotation.
     * 
     * Updates one or more properties of an annotation that matches the specified ID.
     * This operation currently supports updating of the `text`, `tags`, `time` and `timeEnd` properties.
     * This is available in Grafana 6.0.0-beta2 and above.
     */
    'patch'(
      parameters?: Parameters<Paths.PatchAnnotation.PathParameters> | null,
      data?: Paths.PatchAnnotation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PatchAnnotation.Responses.$200>
    /**
     * updateAnnotation - Update Annotation.
     * 
     * Updates all properties of an annotation that matches the specified id. To only update certain property, consider using the Patch Annotation operation.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateAnnotation.PathParameters> | null,
      data?: Paths.UpdateAnnotation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateAnnotation.Responses.$200>
  }
  ['/auth/keys']: {
    /**
     * getAPIkeys - Get auth keys.
     * 
     * Will return auth keys.
     * 
     * Deprecated: true.
     * 
     * Deprecated. Please use GET /api/serviceaccounts and GET /api/serviceaccounts/{id}/tokens instead
     * see https://grafana.com/docs/grafana/next/administration/service-accounts/migrate-api-keys/.
     */
    'get'(
      parameters?: Parameters<Paths.GetAPIkeys.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetAPIkeys.Responses.$200>
    /**
     * addAPIkey - Creates an API key.
     * 
     * Will return details of the created API key.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/auth/keys/{id}']: {
    /**
     * deleteAPIkey - Delete API key.
     * 
     * Deletes an API key.
     * Deprecated. See: https://grafana.com/docs/grafana/next/administration/service-accounts/migrate-api-keys/.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteAPIkey.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteAPIkey.Responses.$200>
  }
  ['/cloudmigration/migration']: {
    /**
     * getSessionList - Get a list of all cloud migration sessions that have been created.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSessionList.Responses.$200>
    /**
     * createSession - Create a migration session.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateSession.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateSession.Responses.$200>
  }
  ['/cloudmigration/migration/{uid}']: {
    /**
     * deleteSession - Delete a migration session by its uid.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteSession.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
    /**
     * getSession - Get a cloud migration session by its uid.
     */
    'get'(
      parameters?: Parameters<Paths.GetSession.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSession.Responses.$200>
  }
  ['/cloudmigration/migration/{uid}/snapshot']: {
    /**
     * createSnapshot - Trigger the creation of an instance snapshot associated with the provided session.
     * 
     * If the snapshot initialization is successful, the snapshot uid is returned.
     */
    'post'(
      parameters?: Parameters<Paths.CreateSnapshot.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateSnapshot.Responses.$200>
  }
  ['/cloudmigration/migration/{uid}/snapshot/{snapshotUid}']: {
    /**
     * getSnapshot - Get metadata about a snapshot, including where it is in its processing and final results.
     */
    'get'(
      parameters?: Parameters<Paths.GetSnapshot.QueryParameters & Paths.GetSnapshot.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSnapshot.Responses.$200>
  }
  ['/cloudmigration/migration/{uid}/snapshot/{snapshotUid}/cancel']: {
    /**
     * cancelSnapshot - Cancel a snapshot, wherever it is in its processing chain.
     * 
     * TODO: Implement
     */
    'post'(
      parameters?: Parameters<Paths.CancelSnapshot.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CancelSnapshot.Responses.$200>
  }
  ['/cloudmigration/migration/{uid}/snapshot/{snapshotUid}/upload']: {
    /**
     * uploadSnapshot - Upload a snapshot to the Grafana Migration Service for processing.
     */
    'post'(
      parameters?: Parameters<Paths.UploadSnapshot.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UploadSnapshot.Responses.$200>
  }
  ['/cloudmigration/migration/{uid}/snapshots']: {
    /**
     * getShapshotList - Get a list of snapshots for a session.
     */
    'get'(
      parameters?: Parameters<Paths.GetShapshotList.QueryParameters & Paths.GetShapshotList.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetShapshotList.Responses.$200>
  }
  ['/cloudmigration/token']: {
    /**
     * getCloudMigrationToken - Fetch the cloud migration token if it exists.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCloudMigrationToken.Responses.$200>
    /**
     * createCloudMigrationToken - Create gcom access token.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateCloudMigrationToken.Responses.$200>
  }
  ['/cloudmigration/token/{uid}']: {
    /**
     * deleteCloudMigrationToken - Deletes a cloud migration token.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteCloudMigrationToken.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteCloudMigrationToken.Responses.$204>
  }
  ['/dashboard/snapshots']: {
    /**
     * searchDashboardSnapshots - List snapshots.
     */
    'get'(
      parameters?: Parameters<Paths.SearchDashboardSnapshots.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchDashboardSnapshots.Responses.$200>
  }
  ['/dashboards/calculate-diff']: {
    /**
     * calculateDashboardDiff - Perform diff on two dashboards.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CalculateDashboardDiff.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CalculateDashboardDiff.Responses.$200>
  }
  ['/dashboards/db']: {
    /**
     * postDashboard - Create / Update dashboard
     * 
     * Creates a new dashboard or updates an existing dashboard.
     * Note: This endpoint is not intended for creating folders, use `POST /api/folders` for that.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.PostDashboard.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PostDashboard.Responses.$200>
  }
  ['/dashboards/home']: {
    /**
     * getHomeDashboard - Get home dashboard.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetHomeDashboard.Responses.$200>
  }
  ['/dashboards/id/{DashboardID}/permissions']: {
    /**
     * getDashboardPermissionsListByID - Gets all existing permissions for the given dashboard.
     * 
     * Please refer to [updated API](#/dashboard_permissions/getDashboardPermissionsListByUID) instead
     */
    'get'(
      parameters?: Parameters<Paths.GetDashboardPermissionsListByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDashboardPermissionsListByID.Responses.$200>
    /**
     * updateDashboardPermissionsByID - Updates permissions for a dashboard.
     * 
     * Please refer to [updated API](#/dashboard_permissions/updateDashboardPermissionsByUID) instead
     * 
     * This operation will remove existing permissions if they’re not included in the request.
     */
    'post'(
      parameters?: Parameters<Paths.UpdateDashboardPermissionsByID.PathParameters> | null,
      data?: Paths.UpdateDashboardPermissionsByID.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateDashboardPermissionsByID.Responses.$200>
  }
  ['/dashboards/id/{DashboardID}/restore']: {
    /**
     * restoreDashboardVersionByID - Restore a dashboard to a given dashboard version.
     * 
     * Please refer to [updated API](#/dashboard_versions/restoreDashboardVersionByUID) instead
     */
    'post'(
      parameters?: Parameters<Paths.RestoreDashboardVersionByID.PathParameters> | null,
      data?: Paths.RestoreDashboardVersionByID.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RestoreDashboardVersionByID.Responses.$200>
  }
  ['/dashboards/id/{DashboardID}/versions']: {
    /**
     * getDashboardVersionsByID - Gets all existing versions for the dashboard.
     * 
     * Please refer to [updated API](#/dashboard_versions/getDashboardVersionsByUID) instead
     */
    'get'(
      parameters?: Parameters<Paths.GetDashboardVersionsByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDashboardVersionsByID.Responses.$200>
  }
  ['/dashboards/id/{DashboardID}/versions/{DashboardVersionID}']: {
    /**
     * getDashboardVersionByID - Get a specific dashboard version.
     * 
     * Please refer to [updated API](#/dashboard_versions/getDashboardVersionByUID) instead
     */
    'get'(
      parameters?: Parameters<Paths.GetDashboardVersionByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDashboardVersionByID.Responses.$200>
  }
  ['/dashboards/import']: {
    /**
     * importDashboard - Import dashboard.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.ImportDashboard.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ImportDashboard.Responses.$200>
  }
  ['/dashboards/public-dashboards']: {
    /**
     * listPublicDashboards - Get list of public dashboards
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListPublicDashboards.Responses.$200>
  }
  ['/dashboards/tags']: {
    /**
     * getDashboardTags - Get all dashboards tags of an organisation.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDashboardTags.Responses.$200>
  }
  ['/dashboards/uid/{dashboardUid}/public-dashboards']: {
    /**
     * getPublicDashboard - Get public dashboard by dashboardUid
     */
    'get'(
      parameters?: Parameters<Paths.GetPublicDashboard.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetPublicDashboard.Responses.$200>
    /**
     * createPublicDashboard - Create public dashboard for a dashboard
     */
    'post'(
      parameters?: Parameters<Paths.CreatePublicDashboard.PathParameters> | null,
      data?: Paths.CreatePublicDashboard.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreatePublicDashboard.Responses.$200>
  }
  ['/dashboards/uid/{dashboardUid}/public-dashboards/{uid}']: {
    /**
     * deletePublicDashboard - Delete public dashboard for a dashboard
     */
    'delete'(
      parameters?: Parameters<Paths.DeletePublicDashboard.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeletePublicDashboard.Responses.$200>
    /**
     * updatePublicDashboard - Update public dashboard for a dashboard
     */
    'patch'(
      parameters?: Parameters<Paths.UpdatePublicDashboard.PathParameters> | null,
      data?: Paths.UpdatePublicDashboard.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdatePublicDashboard.Responses.$200>
  }
  ['/dashboards/uid/{uid}']: {
    /**
     * deleteDashboardByUID - Delete dashboard by uid.
     * 
     * Will delete the dashboard given the specified unique identifier (uid).
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteDashboardByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteDashboardByUID.Responses.$200>
    /**
     * getDashboardByUID - Get dashboard by uid.
     * 
     * Will return the dashboard given the dashboard unique identifier (uid).
     */
    'get'(
      parameters?: Parameters<Paths.GetDashboardByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDashboardByUID.Responses.$200>
  }
  ['/dashboards/uid/{uid}/permissions']: {
    /**
     * getDashboardPermissionsListByUID - Gets all existing permissions for the given dashboard.
     */
    'get'(
      parameters?: Parameters<Paths.GetDashboardPermissionsListByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDashboardPermissionsListByUID.Responses.$200>
    /**
     * updateDashboardPermissionsByUID - Updates permissions for a dashboard.
     * 
     * This operation will remove existing permissions if they’re not included in the request.
     */
    'post'(
      parameters?: Parameters<Paths.UpdateDashboardPermissionsByUID.PathParameters> | null,
      data?: Paths.UpdateDashboardPermissionsByUID.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateDashboardPermissionsByUID.Responses.$200>
  }
  ['/dashboards/uid/{uid}/restore']: {
    /**
     * restoreDashboardVersionByUID - Restore a dashboard to a given dashboard version using UID.
     */
    'post'(
      parameters?: Parameters<Paths.RestoreDashboardVersionByUID.PathParameters> | null,
      data?: Paths.RestoreDashboardVersionByUID.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RestoreDashboardVersionByUID.Responses.$200>
  }
  ['/dashboards/uid/{uid}/trash']: {
    /**
     * hardDeleteDashboardByUID - Hard delete dashboard by uid.
     * 
     * Will delete the dashboard given the specified unique identifier (uid).
     */
    'delete'(
      parameters?: Parameters<Paths.HardDeleteDashboardByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.HardDeleteDashboardByUID.Responses.$200>
    /**
     * restoreDeletedDashboardByUID - Restore a dashboard to a given dashboard version using UID.
     */
    'patch'(
      parameters?: Parameters<Paths.RestoreDeletedDashboardByUID.PathParameters> | null,
      data?: Paths.RestoreDeletedDashboardByUID.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RestoreDeletedDashboardByUID.Responses.$200>
  }
  ['/dashboards/uid/{uid}/versions']: {
    /**
     * getDashboardVersionsByUID - Gets all existing versions for the dashboard using UID.
     */
    'get'(
      parameters?: Parameters<Paths.GetDashboardVersionsByUID.QueryParameters & Paths.GetDashboardVersionsByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDashboardVersionsByUID.Responses.$200>
  }
  ['/dashboards/uid/{uid}/versions/{DashboardVersionID}']: {
    /**
     * getDashboardVersionByUID - Get a specific dashboard version using UID.
     */
    'get'(
      parameters?: Parameters<Paths.GetDashboardVersionByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDashboardVersionByUID.Responses.$200>
  }
  ['/datasources']: {
    /**
     * getDataSources - Get all data sources.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:read` and scope: `datasources:*`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDataSources.Responses.$200>
    /**
     * addDataSource - Create a data source.
     * 
     * By defining `password` and `basicAuthPassword` under secureJsonData property
     * Grafana encrypts them securely as an encrypted blob in the database.
     * The response then lists the encrypted fields under secureJsonFields.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:create`
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.AddDataSource.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddDataSource.Responses.$200>
  }
  ['/datasources/correlations']: {
    /**
     * getCorrelations - Gets all correlations.
     */
    'get'(
      parameters?: Parameters<Paths.GetCorrelations.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCorrelations.Responses.$200>
  }
  ['/datasources/id/{name}']: {
    /**
     * getDataSourceIdByName - Get data source Id by Name.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:read` and scopes: `datasources:*`, `datasources:name:*` and `datasources:name:test_datasource` (single data source).
     */
    'get'(
      parameters?: Parameters<Paths.GetDataSourceIdByName.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDataSourceIdByName.Responses.$200>
  }
  ['/datasources/name/{name}']: {
    /**
     * deleteDataSourceByName - Delete an existing data source by name.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:delete` and scopes: `datasources:*`, `datasources:name:*` and `datasources:name:test_datasource` (single data source).
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteDataSourceByName.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteDataSourceByName.Responses.$200>
    /**
     * getDataSourceByName - Get a single data source by Name.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:read` and scopes: `datasources:*`, `datasources:name:*` and `datasources:name:test_datasource` (single data source).
     */
    'get'(
      parameters?: Parameters<Paths.GetDataSourceByName.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDataSourceByName.Responses.$200>
  }
  ['/datasources/proxy/uid/{uid}/{datasource_proxy_route}']: {
    /**
     * datasourceProxyDELETEByUIDcalls - Data source proxy DELETE calls.
     * 
     * Proxies all calls to the actual data source.
     */
    'delete'(
      parameters?: Parameters<Paths.DatasourceProxyDELETEByUIDcalls.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DatasourceProxyDELETEByUIDcalls.Responses.$202>
    /**
     * datasourceProxyGETByUIDcalls - Data source proxy GET calls.
     * 
     * Proxies all calls to the actual data source.
     */
    'get'(
      parameters?: Parameters<Paths.DatasourceProxyGETByUIDcalls.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DatasourceProxyGETByUIDcalls.Responses.$200>
    /**
     * datasourceProxyPOSTByUIDcalls - Data source proxy POST calls.
     * 
     * Proxies all calls to the actual data source. The data source should support POST methods for the specific path and role as defined
     */
    'post'(
      parameters?: Parameters<Paths.DatasourceProxyPOSTByUIDcalls.PathParameters> | null,
      data?: Paths.DatasourceProxyPOSTByUIDcalls.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DatasourceProxyPOSTByUIDcalls.Responses.$201 | Paths.DatasourceProxyPOSTByUIDcalls.Responses.$202>
  }
  ['/datasources/proxy/{id}/{datasource_proxy_route}']: {
    /**
     * datasourceProxyDELETEcalls - Data source proxy DELETE calls.
     * 
     * Proxies all calls to the actual data source.
     * 
     * Please refer to [updated API](#/datasources/datasourceProxyDELETEByUIDcalls) instead
     */
    'delete'(
      parameters?: Parameters<Paths.DatasourceProxyDELETEcalls.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DatasourceProxyDELETEcalls.Responses.$202>
    /**
     * datasourceProxyGETcalls - Data source proxy GET calls.
     * 
     * Proxies all calls to the actual data source.
     * 
     * Please refer to [updated API](#/datasources/datasourceProxyGETByUIDcalls) instead
     */
    'get'(
      parameters?: Parameters<Paths.DatasourceProxyGETcalls.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DatasourceProxyGETcalls.Responses.$200>
    /**
     * datasourceProxyPOSTcalls - Data source proxy POST calls.
     * 
     * Proxies all calls to the actual data source. The data source should support POST methods for the specific path and role as defined
     * 
     * Please refer to [updated API](#/datasources/datasourceProxyPOSTByUIDcalls) instead
     */
    'post'(
      parameters?: Parameters<Paths.DatasourceProxyPOSTcalls.PathParameters> | null,
      data?: Paths.DatasourceProxyPOSTcalls.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DatasourceProxyPOSTcalls.Responses.$201 | Paths.DatasourceProxyPOSTcalls.Responses.$202>
  }
  ['/datasources/uid/{sourceUID}/correlations']: {
    /**
     * getCorrelationsBySourceUID - Gets all correlations originating from the given data source.
     */
    'get'(
      parameters?: Parameters<Paths.GetCorrelationsBySourceUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCorrelationsBySourceUID.Responses.$200>
    /**
     * createCorrelation - Add correlation.
     */
    'post'(
      parameters?: Parameters<Paths.CreateCorrelation.PathParameters> | null,
      data?: Paths.CreateCorrelation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateCorrelation.Responses.$200>
  }
  ['/datasources/uid/{sourceUID}/correlations/{correlationUID}']: {
    /**
     * getCorrelation - Gets a correlation.
     */
    'get'(
      parameters?: Parameters<Paths.GetCorrelation.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCorrelation.Responses.$200>
    /**
     * updateCorrelation - Updates a correlation.
     */
    'patch'(
      parameters?: Parameters<Paths.UpdateCorrelation.PathParameters> | null,
      data?: Paths.UpdateCorrelation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateCorrelation.Responses.$200>
  }
  ['/datasources/uid/{uid}']: {
    /**
     * deleteDataSourceByUID - Delete an existing data source by UID.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:delete` and scopes: `datasources:*`, `datasources:uid:*` and `datasources:uid:kLtEtcRGk` (single data source).
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteDataSourceByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteDataSourceByUID.Responses.$200>
    /**
     * getDataSourceByUID - Get a single data source by UID.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:read` and scopes: `datasources:*`, `datasources:uid:*` and `datasources:uid:kLtEtcRGk` (single data source).
     */
    'get'(
      parameters?: Parameters<Paths.GetDataSourceByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDataSourceByUID.Responses.$200>
    /**
     * updateDataSourceByUID - Update an existing data source.
     * 
     * Similar to creating a data source, `password` and `basicAuthPassword` should be defined under
     * secureJsonData in order to be stored securely as an encrypted blob in the database. Then, the
     * encrypted fields are listed under secureJsonFields section in the response.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:write` and scopes: `datasources:*`, `datasources:uid:*` and `datasources:uid:1` (single data source).
     */
    'put'(
      parameters?: Parameters<Paths.UpdateDataSourceByUID.PathParameters> | null,
      data?: Paths.UpdateDataSourceByUID.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateDataSourceByUID.Responses.$200>
  }
  ['/datasources/uid/{uid}/correlations/{correlationUID}']: {
    /**
     * deleteCorrelation - Delete a correlation.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteCorrelation.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteCorrelation.Responses.$200>
  }
  ['/datasources/uid/{uid}/health']: {
    /**
     * checkDatasourceHealthWithUID - Sends a health check request to the plugin datasource identified by the UID.
     */
    'get'(
      parameters?: Parameters<Paths.CheckDatasourceHealthWithUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CheckDatasourceHealthWithUID.Responses.$200>
  }
  ['/datasources/uid/{uid}/lbac/teams']: {
    /**
     * getTeamLBACRulesApi - Retrieves LBAC rules for a team.
     */
    'get'(
      parameters?: Parameters<Paths.GetTeamLBACRulesApi.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetTeamLBACRulesApi.Responses.$200>
    /**
     * updateTeamLBACRulesApi - Updates LBAC rules for a team.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateTeamLBACRulesApi.PathParameters> | null,
      data?: Paths.UpdateTeamLBACRulesApi.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateTeamLBACRulesApi.Responses.$200>
  }
  ['/datasources/uid/{uid}/resources/{datasource_proxy_route}']: {
    /**
     * callDatasourceResourceWithUID - Fetch data source resources.
     */
    'get'(
      parameters?: Parameters<Paths.CallDatasourceResourceWithUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CallDatasourceResourceWithUID.Responses.$200>
  }
  ['/datasources/{dataSourceUID}/cache']: {
    /**
     * getDataSourceCacheConfig - get cache config for a single data source
     */
    'get'(
      parameters?: Parameters<Paths.GetDataSourceCacheConfig.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDataSourceCacheConfig.Responses.$200>
    /**
     * setDataSourceCacheConfig - set cache config for a single data source
     */
    'post'(
      parameters?: Parameters<Paths.SetDataSourceCacheConfig.PathParameters> | null,
      data?: Paths.SetDataSourceCacheConfig.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetDataSourceCacheConfig.Responses.$200>
  }
  ['/datasources/{dataSourceUID}/cache/clean']: {
    /**
     * cleanDataSourceCache - clean cache for a single data source
     */
    'post'(
      parameters?: Parameters<Paths.CleanDataSourceCache.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CleanDataSourceCache.Responses.$200>
  }
  ['/datasources/{dataSourceUID}/cache/disable']: {
    /**
     * disableDataSourceCache - disable cache for a single data source
     */
    'post'(
      parameters?: Parameters<Paths.DisableDataSourceCache.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DisableDataSourceCache.Responses.$200>
  }
  ['/datasources/{dataSourceUID}/cache/enable']: {
    /**
     * enableDataSourceCache - enable cache for a single data source
     */
    'post'(
      parameters?: Parameters<Paths.EnableDataSourceCache.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.EnableDataSourceCache.Responses.$200>
  }
  ['/datasources/{id}']: {
    /**
     * deleteDataSourceByID - Delete an existing data source by id.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:delete` and scopes: `datasources:*`, `datasources:id:*` and `datasources:id:1` (single data source).
     * 
     * Please refer to [updated API](#/datasources/deleteDataSourceByUID) instead
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteDataSourceByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteDataSourceByID.Responses.$200>
    /**
     * getDataSourceByID - Get a single data source by Id.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:read` and scopes: `datasources:*`, `datasources:id:*` and `datasources:id:1` (single data source).
     * 
     * Please refer to [updated API](#/datasources/getDataSourceByUID) instead
     */
    'get'(
      parameters?: Parameters<Paths.GetDataSourceByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDataSourceByID.Responses.$200>
    /**
     * updateDataSourceByID - Update an existing data source by its sequential ID.
     * 
     * Similar to creating a data source, `password` and `basicAuthPassword` should be defined under
     * secureJsonData in order to be stored securely as an encrypted blob in the database. Then, the
     * encrypted fields are listed under secureJsonFields section in the response.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:write` and scopes: `datasources:*`, `datasources:id:*` and `datasources:id:1` (single data source).
     * 
     * Please refer to [updated API](#/datasources/updateDataSourceByUID) instead
     */
    'put'(
      parameters?: Parameters<Paths.UpdateDataSourceByID.PathParameters> | null,
      data?: Paths.UpdateDataSourceByID.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateDataSourceByID.Responses.$200>
  }
  ['/datasources/{id}/health']: {
    /**
     * checkDatasourceHealthByID - Sends a health check request to the plugin datasource identified by the ID.
     * 
     * Please refer to [updated API](#/datasources/checkDatasourceHealthWithUID) instead
     */
    'get'(
      parameters?: Parameters<Paths.CheckDatasourceHealthByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CheckDatasourceHealthByID.Responses.$200>
  }
  ['/datasources/{id}/resources/{datasource_proxy_route}']: {
    /**
     * callDatasourceResourceByID - Fetch data source resources by Id.
     * 
     * Please refer to [updated API](#/datasources/callDatasourceResourceWithUID) instead
     */
    'get'(
      parameters?: Parameters<Paths.CallDatasourceResourceByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CallDatasourceResourceByID.Responses.$200>
  }
  ['/ds/query']: {
    /**
     * queryMetricsWithExpressions - DataSource query metrics with expressions.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `datasources:query`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.QueryMetricsWithExpressions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.QueryMetricsWithExpressions.Responses.$200 | Paths.QueryMetricsWithExpressions.Responses.$207>
  }
  ['/folders']: {
    /**
     * getFolders - Get all folders.
     * 
     * It returns all folders that the authenticated user has permission to view.
     * If nested folders are enabled, it expects an additional query parameter with the parent folder UID
     * and returns the immediate subfolders that the authenticated user has permission to view.
     * If the parameter is not supplied then it returns immediate subfolders under the root
     * that the authenticated user has permission to view.
     */
    'get'(
      parameters?: Parameters<Paths.GetFolders.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetFolders.Responses.$200>
    /**
     * createFolder - Create folder.
     * 
     * If nested folders are enabled then it additionally expects the parent folder UID.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateFolder.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateFolder.Responses.$200>
  }
  ['/folders/id/{folder_id}']: {
    /**
     * getFolderByID - Get folder by id.
     * 
     * Returns the folder identified by id. This is deprecated.
     * Please refer to [updated API](#/folders/getFolderByUID) instead
     */
    'get'(
      parameters?: Parameters<Paths.GetFolderByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetFolderByID.Responses.$200>
  }
  ['/folders/{folder_uid}']: {
    /**
     * deleteFolder - Delete folder.
     * 
     * Deletes an existing folder identified by UID along with all dashboards (and their alerts) stored in the folder. This operation cannot be reverted.
     * If nested folders are enabled then it also deletes all the subfolders.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteFolder.QueryParameters & Paths.DeleteFolder.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteFolder.Responses.$200>
    /**
     * getFolderByUID - Get folder by uid.
     */
    'get'(
      parameters?: Parameters<Paths.GetFolderByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetFolderByUID.Responses.$200>
    /**
     * updateFolder - Update folder.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateFolder.PathParameters> | null,
      data?: Paths.UpdateFolder.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateFolder.Responses.$200>
  }
  ['/folders/{folder_uid}/counts']: {
    /**
     * getFolderDescendantCounts - Gets the count of each descendant of a folder by kind. The folder is identified by UID.
     */
    'get'(
      parameters?: Parameters<Paths.GetFolderDescendantCounts.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetFolderDescendantCounts.Responses.$200>
  }
  ['/folders/{folder_uid}/move']: {
    /**
     * moveFolder - Move folder.
     */
    'post'(
      parameters?: Parameters<Paths.MoveFolder.PathParameters> | null,
      data?: Paths.MoveFolder.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.MoveFolder.Responses.$200>
  }
  ['/folders/{folder_uid}/permissions']: {
    /**
     * getFolderPermissionList - Gets all existing permissions for the folder with the given `uid`.
     */
    'get'(
      parameters?: Parameters<Paths.GetFolderPermissionList.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetFolderPermissionList.Responses.$200>
    /**
     * updateFolderPermissions - Updates permissions for a folder. This operation will remove existing permissions if they’re not included in the request.
     */
    'post'(
      parameters?: Parameters<Paths.UpdateFolderPermissions.PathParameters> | null,
      data?: Paths.UpdateFolderPermissions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateFolderPermissions.Responses.$200>
  }
  ['/groupsync/groups']: {
    /**
     * getMappedGroups - List groups that have mappings set. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetMappedGroups.Responses.$200>
  }
  ['/groupsync/groups/{group_id}']: {
    /**
     * deleteGroupMappings - Delete mappings for a group. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteGroupMappings.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteGroupMappings.Responses.$204>
    /**
     * createGroupMappings - Create mappings for a group. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
     */
    'post'(
      parameters?: Parameters<Paths.CreateGroupMappings.PathParameters> | null,
      data?: Paths.CreateGroupMappings.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateGroupMappings.Responses.$201>
    /**
     * updateGroupMappings - Update mappings for a group. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateGroupMappings.PathParameters> | null,
      data?: Paths.UpdateGroupMappings.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateGroupMappings.Responses.$201>
  }
  ['/groupsync/groups/{group_id}/roles']: {
    /**
     * getGroupRoles - Get roles mapped to a group. This endpoint is behind the feature flag `groupAttributeSync` and is considered experimental.
     */
    'get'(
      parameters?: Parameters<Paths.GetGroupRoles.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetGroupRoles.Responses.$200>
  }
  ['/health']: {
    /**
     * getHealth - apiHealthHandler will return ok if Grafana's web server is running and it
     * can access the database. If the database cannot be accessed it will return
     * http status code 503.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetHealth.Responses.$200>
  }
  ['/library-elements']: {
    /**
     * getLibraryElements - Get all library elements.
     * 
     * Returns a list of all library elements the authenticated user has permission to view.
     * Use the `perPage` query parameter to control the maximum number of library elements returned; the default limit is `100`.
     * You can also use the `page` query parameter to fetch library elements from any page other than the first one.
     */
    'get'(
      parameters?: Parameters<Paths.GetLibraryElements.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetLibraryElements.Responses.$200>
    /**
     * createLibraryElement - Create library element.
     * 
     * Creates a new library element.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateLibraryElement.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateLibraryElement.Responses.$200>
  }
  ['/library-elements/name/{library_element_name}']: {
    /**
     * getLibraryElementByName - Get library element by name.
     * 
     * Returns a library element with the given name.
     */
    'get'(
      parameters?: Parameters<Paths.GetLibraryElementByName.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetLibraryElementByName.Responses.$200>
  }
  ['/library-elements/{library_element_uid}']: {
    /**
     * deleteLibraryElementByUID - Delete library element.
     * 
     * Deletes an existing library element as specified by the UID. This operation cannot be reverted.
     * You cannot delete a library element that is connected. This operation cannot be reverted.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteLibraryElementByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteLibraryElementByUID.Responses.$200>
    /**
     * getLibraryElementByUID - Get library element by UID.
     * 
     * Returns a library element with the given UID.
     */
    'get'(
      parameters?: Parameters<Paths.GetLibraryElementByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetLibraryElementByUID.Responses.$200>
    /**
     * updateLibraryElement - Update library element.
     * 
     * Updates an existing library element identified by uid.
     */
    'patch'(
      parameters?: Parameters<Paths.UpdateLibraryElement.PathParameters> | null,
      data?: Paths.UpdateLibraryElement.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateLibraryElement.Responses.$200>
  }
  ['/library-elements/{library_element_uid}/connections/']: {
    /**
     * getLibraryElementConnections - Get library element connections.
     * 
     * Returns a list of connections for a library element based on the UID specified.
     */
    'get'(
      parameters?: Parameters<Paths.GetLibraryElementConnections.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetLibraryElementConnections.Responses.$200>
  }
  ['/licensing/check']: {
    /**
     * getStatus - Check license availability.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetStatus.Responses.$200>
  }
  ['/licensing/custom-permissions']: {
    /**
     * getCustomPermissionsReport - Get custom permissions report.
     * 
     * You need to have a permission with action `licensing.reports:read`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/licensing/custom-permissions-csv']: {
    /**
     * getCustomPermissionsCSV - Get custom permissions report in CSV format.
     * 
     * You need to have a permission with action `licensing.reports:read`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/licensing/refresh-stats']: {
    /**
     * refreshLicenseStats - Refresh license stats.
     * 
     * You need to have a permission with action `licensing:read`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RefreshLicenseStats.Responses.$200>
  }
  ['/licensing/token']: {
    /**
     * deleteLicenseToken - Remove license from database.
     * 
     * Removes the license stored in the Grafana database. Available in Grafana Enterprise v7.4+.
     * 
     * You need to have a permission with action `licensing:delete`.
     */
    'delete'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.DeleteLicenseToken.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteLicenseToken.Responses.$202>
    /**
     * getLicenseToken - Get license token.
     * 
     * You need to have a permission with action `licensing:read`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetLicenseToken.Responses.$200>
    /**
     * postLicenseToken - Create license token.
     * 
     * You need to have a permission with action `licensing:update`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.PostLicenseToken.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PostLicenseToken.Responses.$200>
  }
  ['/licensing/token/renew']: {
    /**
     * postRenewLicenseToken - Manually force license refresh.
     * 
     * Manually ask license issuer for a new token. Available in Grafana Enterprise v7.4+.
     * 
     * You need to have a permission with action `licensing:update`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.PostRenewLicenseToken.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PostRenewLicenseToken.Responses.$200>
  }
  ['/logout/saml']: {
    /**
     * getSAMLLogout - GetLogout initiates single logout process.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/org']: {
    /**
     * getCurrentOrg - Get current Organization.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCurrentOrg.Responses.$200>
    /**
     * updateCurrentOrg - Update current Organization.
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.UpdateCurrentOrg.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateCurrentOrg.Responses.$200>
  }
  ['/org/address']: {
    /**
     * updateCurrentOrgAddress - Update current Organization's address.
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.UpdateCurrentOrgAddress.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateCurrentOrgAddress.Responses.$200>
  }
  ['/org/invites']: {
    /**
     * getPendingOrgInvites - Get pending invites.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetPendingOrgInvites.Responses.$200>
    /**
     * addOrgInvite - Add invite.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.AddOrgInvite.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddOrgInvite.Responses.$200>
  }
  ['/org/invites/{invitation_code}/revoke']: {
    /**
     * revokeInvite - Revoke invite.
     */
    'delete'(
      parameters?: Parameters<Paths.RevokeInvite.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RevokeInvite.Responses.$200>
  }
  ['/org/preferences']: {
    /**
     * getOrgPreferences - Get Current Org Prefs.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetOrgPreferences.Responses.$200>
    /**
     * patchOrgPreferences - Patch Current Org Prefs.
     */
    'patch'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.PatchOrgPreferences.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PatchOrgPreferences.Responses.$200>
    /**
     * updateOrgPreferences - Update Current Org Prefs.
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.UpdateOrgPreferences.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateOrgPreferences.Responses.$200>
  }
  ['/org/quotas']: {
    /**
     * getCurrentOrgQuota - Fetch Organization quota.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `orgs.quotas:read` and scope `org:id:1` (orgIDScope).
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCurrentOrgQuota.Responses.$200>
  }
  ['/org/users']: {
    /**
     * getOrgUsersForCurrentOrg - Get all users within the current organization.
     * 
     * Returns all org users within the current organization. Accessible to users with org admin role.
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `org.users:read` with scope `users:*`.
     */
    'get'(
      parameters?: Parameters<Paths.GetOrgUsersForCurrentOrg.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetOrgUsersForCurrentOrg.Responses.$200>
    /**
     * addOrgUserToCurrentOrg - Add a new user to the current organization.
     * 
     * Adds a global user to the current organization.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `org.users:add` with scope `users:*`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.AddOrgUserToCurrentOrg.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddOrgUserToCurrentOrg.Responses.$200>
  }
  ['/org/users/lookup']: {
    /**
     * getOrgUsersForCurrentOrgLookup - Get all users within the current organization (lookup)
     * 
     * Returns all org users within the current organization, but with less detailed information.
     * Accessible to users with org admin role, admin in any folder or admin of any team.
     * Mainly used by Grafana UI for providing list of users when adding team members and when editing folder/dashboard permissions.
     */
    'get'(
      parameters?: Parameters<Paths.GetOrgUsersForCurrentOrgLookup.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetOrgUsersForCurrentOrgLookup.Responses.$200>
  }
  ['/org/users/{user_id}']: {
    /**
     * removeOrgUserForCurrentOrg - Delete user in current organization.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `org.users:remove` with scope `users:*`.
     */
    'delete'(
      parameters?: Parameters<Paths.RemoveOrgUserForCurrentOrg.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RemoveOrgUserForCurrentOrg.Responses.$200>
    /**
     * updateOrgUserForCurrentOrg - Updates the given user.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `org.users.role:update` with scope `users:*`.
     */
    'patch'(
      parameters?: Parameters<Paths.UpdateOrgUserForCurrentOrg.PathParameters> | null,
      data?: Paths.UpdateOrgUserForCurrentOrg.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateOrgUserForCurrentOrg.Responses.$200>
  }
  ['/orgs']: {
    /**
     * searchOrgs - Search all Organizations.
     */
    'get'(
      parameters?: Parameters<Paths.SearchOrgs.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchOrgs.Responses.$200>
    /**
     * createOrg - Create Organization.
     * 
     * Only works if [users.allow_org_create](https://grafana.com/docs/grafana/latest/administration/configuration/#allow_org_create) is set.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateOrg.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateOrg.Responses.$200>
  }
  ['/orgs/name/{org_name}']: {
    /**
     * getOrgByName - Get Organization by ID.
     */
    'get'(
      parameters?: Parameters<Paths.GetOrgByName.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetOrgByName.Responses.$200>
  }
  ['/orgs/{org_id}']: {
    /**
     * deleteOrgByID - Delete Organization.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteOrgByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteOrgByID.Responses.$200>
    /**
     * getOrgByID - Get Organization by ID.
     */
    'get'(
      parameters?: Parameters<Paths.GetOrgByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetOrgByID.Responses.$200>
    /**
     * updateOrg - Update Organization.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateOrg.PathParameters> | null,
      data?: Paths.UpdateOrg.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateOrg.Responses.$200>
  }
  ['/orgs/{org_id}/address']: {
    /**
     * updateOrgAddress - Update Organization's address.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateOrgAddress.PathParameters> | null,
      data?: Paths.UpdateOrgAddress.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateOrgAddress.Responses.$200>
  }
  ['/orgs/{org_id}/quotas']: {
    /**
     * getOrgQuota - Fetch Organization quota.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `orgs.quotas:read` and scope `org:id:1` (orgIDScope).
     */
    'get'(
      parameters?: Parameters<Paths.GetOrgQuota.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetOrgQuota.Responses.$200>
  }
  ['/orgs/{org_id}/quotas/{quota_target}']: {
    /**
     * updateOrgQuota - Update user quota.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled, you need to have a permission with action `orgs.quotas:write` and scope `org:id:1` (orgIDScope).
     */
    'put'(
      parameters?: Parameters<Paths.UpdateOrgQuota.PathParameters> | null,
      data?: Paths.UpdateOrgQuota.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateOrgQuota.Responses.$200>
  }
  ['/orgs/{org_id}/users']: {
    /**
     * getOrgUsers - Get Users in Organization.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `org.users:read` with scope `users:*`.
     */
    'get'(
      parameters?: Parameters<Paths.GetOrgUsers.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetOrgUsers.Responses.$200>
    /**
     * addOrgUser - Add a new user to the current organization.
     * 
     * Adds a global user to the current organization.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `org.users:add` with scope `users:*`.
     */
    'post'(
      parameters?: Parameters<Paths.AddOrgUser.PathParameters> | null,
      data?: Paths.AddOrgUser.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddOrgUser.Responses.$200>
  }
  ['/orgs/{org_id}/users/search']: {
    /**
     * searchOrgUsers - Search Users in Organization.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `org.users:read` with scope `users:*`.
     */
    'get'(
      parameters?: Parameters<Paths.SearchOrgUsers.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchOrgUsers.Responses.$200>
  }
  ['/orgs/{org_id}/users/{user_id}']: {
    /**
     * removeOrgUser - Delete user in current organization.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `org.users:remove` with scope `users:*`.
     */
    'delete'(
      parameters?: Parameters<Paths.RemoveOrgUser.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RemoveOrgUser.Responses.$200>
    /**
     * updateOrgUser - Update Users in Organization.
     * 
     * If you are running Grafana Enterprise and have Fine-grained access control enabled
     * you need to have a permission with action: `org.users.role:update` with scope `users:*`.
     */
    'patch'(
      parameters?: Parameters<Paths.UpdateOrgUser.PathParameters> | null,
      data?: Paths.UpdateOrgUser.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateOrgUser.Responses.$200>
  }
  ['/playlists']: {
    /**
     * searchPlaylists - Get playlists.
     */
    'get'(
      parameters?: Parameters<Paths.SearchPlaylists.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchPlaylists.Responses.$200>
    /**
     * createPlaylist - Create playlist.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreatePlaylist.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreatePlaylist.Responses.$200>
  }
  ['/playlists/{uid}']: {
    /**
     * deletePlaylist - Delete playlist.
     */
    'delete'(
      parameters?: Parameters<Paths.DeletePlaylist.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeletePlaylist.Responses.$200>
    /**
     * getPlaylist - Get playlist.
     */
    'get'(
      parameters?: Parameters<Paths.GetPlaylist.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetPlaylist.Responses.$200>
    /**
     * updatePlaylist - Update playlist.
     */
    'put'(
      parameters?: Parameters<Paths.UpdatePlaylist.PathParameters> | null,
      data?: Paths.UpdatePlaylist.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdatePlaylist.Responses.$200>
  }
  ['/playlists/{uid}/items']: {
    /**
     * getPlaylistItems - Get playlist items.
     */
    'get'(
      parameters?: Parameters<Paths.GetPlaylistItems.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetPlaylistItems.Responses.$200>
  }
  ['/public/dashboards/{accessToken}']: {
    /**
     * viewPublicDashboard - Get public dashboard for view
     */
    'get'(
      parameters?: Parameters<Paths.ViewPublicDashboard.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ViewPublicDashboard.Responses.$200>
  }
  ['/public/dashboards/{accessToken}/annotations']: {
    /**
     * getPublicAnnotations - Get annotations for a public dashboard
     */
    'get'(
      parameters?: Parameters<Paths.GetPublicAnnotations.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetPublicAnnotations.Responses.$200>
  }
  ['/public/dashboards/{accessToken}/panels/{panelId}/query']: {
    /**
     * queryPublicDashboard - Get results for a given panel on a public dashboard
     */
    'post'(
      parameters?: Parameters<Paths.QueryPublicDashboard.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.QueryPublicDashboard.Responses.$200>
  }
  ['/query-history']: {
    /**
     * searchQueries - Query history search.
     * 
     * Returns a list of queries in the query history that matches the search criteria.
     * Query history search supports pagination. Use the `limit` parameter to control the maximum number of queries returned; the default limit is 100.
     * You can also use the `page` query parameter to fetch queries from any page other than the first one.
     */
    'get'(
      parameters?: Parameters<Paths.SearchQueries.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchQueries.Responses.$200>
    /**
     * createQuery - Add query to query history.
     * 
     * Adds new query to query history.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateQuery.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateQuery.Responses.$200>
  }
  ['/query-history/star/{query_history_uid}']: {
    /**
     * unstarQuery - Remove star to query in query history.
     * 
     * Removes star from query in query history as specified by the UID.
     */
    'delete'(
      parameters?: Parameters<Paths.UnstarQuery.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UnstarQuery.Responses.$200>
    /**
     * starQuery - Add star to query in query history.
     * 
     * Adds star to query in query history as specified by the UID.
     */
    'post'(
      parameters?: Parameters<Paths.StarQuery.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.StarQuery.Responses.$200>
  }
  ['/query-history/{query_history_uid}']: {
    /**
     * deleteQuery - Delete query in query history.
     * 
     * Deletes an existing query in query history as specified by the UID. This operation cannot be reverted.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteQuery.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteQuery.Responses.$200>
    /**
     * patchQueryComment - Update comment for query in query history.
     * 
     * Updates comment for query in query history as specified by the UID.
     */
    'patch'(
      parameters?: Parameters<Paths.PatchQueryComment.PathParameters> | null,
      data?: Paths.PatchQueryComment.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PatchQueryComment.Responses.$200>
  }
  ['/recording-rules']: {
    /**
     * listRecordingRules - Lists all rules in the database: active or deleted.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListRecordingRules.Responses.$200>
    /**
     * createRecordingRule - Create a recording rule that is then registered and started.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateRecordingRule.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateRecordingRule.Responses.$200>
    /**
     * updateRecordingRule - Update the active status of a rule.
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.UpdateRecordingRule.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateRecordingRule.Responses.$200>
  }
  ['/recording-rules/test']: {
    /**
     * testCreateRecordingRule - Test a recording rule.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.TestCreateRecordingRule.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.TestCreateRecordingRule.Responses.$200>
  }
  ['/recording-rules/writer']: {
    /**
     * deleteRecordingRuleWriteTarget - Delete the remote write target.
     */
    'delete'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteRecordingRuleWriteTarget.Responses.$200>
    /**
     * getRecordingRuleWriteTarget - Return the prometheus remote write target.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetRecordingRuleWriteTarget.Responses.$200>
    /**
     * createRecordingRuleWriteTarget - Create a remote write target.
     * 
     * It returns a 422 if there is not an existing prometheus data source configured.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateRecordingRuleWriteTarget.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateRecordingRuleWriteTarget.Responses.$200>
  }
  ['/recording-rules/{recordingRuleID}']: {
    /**
     * deleteRecordingRule - Delete removes the rule from the registry and stops it.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteRecordingRule.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteRecordingRule.Responses.$200>
  }
  ['/reports']: {
    /**
     * getReports - List reports.
     * 
     * Available to org admins only and with a valid or expired license.
     * 
     * You need to have a permission with action `reports:read` with scope `reports:*`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetReports.Responses.$200>
    /**
     * createReport - Create a report.
     * 
     * Available to org admins only and with a valid license.
     * 
     * You need to have a permission with action `reports.admin:create`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateReport.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateReport.Responses.$200>
  }
  ['/reports/email']: {
    /**
     * sendReport - Send a report.
     * 
     * Generate and send a report. This API waits for the report to be generated before returning. We recommend that you set the client’s timeout to at least 60 seconds. Available to org admins only and with a valid license.
     * 
     * Only available in Grafana Enterprise v7.0+.
     * This API endpoint is experimental and may be deprecated in a future release. On deprecation, a migration strategy will be provided and the endpoint will remain functional until the next major release of Grafana.
     * 
     * You need to have a permission with action `reports:send`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.SendReport.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SendReport.Responses.$200>
  }
  ['/reports/images/:image']: {
    /**
     * getSettingsImage - Get custom branding report image.
     * 
     * Available to org admins only and with a valid or expired license.
     * 
     * You need to have a permission with action `reports.settings:read`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSettingsImage.Responses.$200>
  }
  ['/reports/render/csvs']: {
    /**
     * renderReportCSVs - Download a CSV report.
     * 
     * Available to all users and with a valid license.
     */
    'get'(
      parameters?: Parameters<Paths.RenderReportCSVs.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RenderReportCSVs.Responses.$200 | Paths.RenderReportCSVs.Responses.$204>
  }
  ['/reports/render/pdfs']: {
    /**
     * renderReportPDFs - Render report for multiple dashboards.
     * 
     * Available to all users and with a valid license.
     */
    'get'(
      parameters?: Parameters<Paths.RenderReportPDFs.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RenderReportPDFs.Responses.$200>
  }
  ['/reports/settings']: {
    /**
     * getReportSettings - Get report settings.
     * 
     * Available to org admins only and with a valid or expired license.
     * 
     * You need to have a permission with action `reports.settings:read`x.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetReportSettings.Responses.$200>
    /**
     * saveReportSettings - Save settings.
     * 
     * Available to org admins only and with a valid or expired license.
     * 
     * You need to have a permission with action `reports.settings:write`xx.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.SaveReportSettings.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SaveReportSettings.Responses.$200>
  }
  ['/reports/test-email']: {
    /**
     * sendTestEmail - Send test report via email.
     * 
     * Available to org admins only and with a valid license.
     * 
     * You need to have a permission with action `reports:send`.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.SendTestEmail.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SendTestEmail.Responses.$200>
  }
  ['/reports/{id}']: {
    /**
     * deleteReport - Delete a report.
     * 
     * Available to org admins only and with a valid or expired license.
     * 
     * You need to have a permission with action `reports.delete` with scope `reports:id:<report ID>`.
     * 
     * Requesting reports using the internal id will stop workgin in the future
     * Use the reporting apiserver to manage reports.  See: /apis/reporting.grafana.app/
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteReport.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteReport.Responses.$200>
    /**
     * getReport - Get a report.
     * 
     * Available to org admins only and with a valid or expired license.
     * 
     * You need to have a permission with action `reports:read` with scope `reports:id:<report ID>`.
     * 
     * Requesting reports using the internal id will stop workgin in the future
     * Use the reporting apiserver to manage reports.  See: /apis/reporting.grafana.app/
     */
    'get'(
      parameters?: Parameters<Paths.GetReport.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetReport.Responses.$200>
    /**
     * updateReport - Update a report.
     * 
     * Available to org admins only and with a valid or expired license.
     * 
     * You need to have a permission with action `reports.admin:write` with scope `reports:id:<report ID>`.
     * 
     * Requesting reports using the internal id will stop workgin in the future
     * Use the reporting apiserver to manage reports.  See: /apis/reporting.grafana.app/
     */
    'put'(
      parameters?: Parameters<Paths.UpdateReport.PathParameters> | null,
      data?: Paths.UpdateReport.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateReport.Responses.$200>
  }
  ['/saml/acs']: {
    /**
     * postACS - It performs Assertion Consumer Service (ACS).
     */
    'post'(
      parameters?: Parameters<Paths.PostACS.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/saml/metadata']: {
    /**
     * getMetadata - It exposes the SP (Grafana's) metadata for the IdP's consumption.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetMetadata.Responses.$200>
  }
  ['/saml/slo']: {
    /**
     * getSLO - It performs Single Logout (SLO) callback.
     * 
     * There might be two possible requests:
     * 1. Logout response (callback) when Grafana initiates single logout and IdP returns response to logout request.
     * 2. Logout request when another SP initiates single logout and IdP sends logout request to the Grafana,
     * or in case of IdP-initiated logout.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
    /**
     * postSLO - It performs Single Logout (SLO) callback.
     * 
     * There might be two possible requests:
     * 1. Logout response (callback) when Grafana initiates single logout and IdP returns response to logout request.
     * 2. Logout request when another SP initiates single logout and IdP sends logout request to the Grafana,
     * or in case of IdP-initiated logout.
     */
    'post'(
      parameters?: Parameters<Paths.PostSLO.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/search']: {
    /**
     * search
     */
    'get'(
      parameters?: Parameters<Paths.Search.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.Search.Responses.$200>
    /**
     * SearchDevices - Lists all devices within the last 30 days
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchDevices.Responses.$200>
  }
  ['/search/sorting']: {
    /**
     * listSortOptions - List search sorting options.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListSortOptions.Responses.$200>
  }
  ['/serviceaccounts']: {
    /**
     * createServiceAccount - Create service account
     * 
     * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
     * action: `serviceaccounts:write` scope: `serviceaccounts:*`
     * 
     * Requires basic authentication and that the authenticated user is a Grafana Admin.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateServiceAccount.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateServiceAccount.Responses.$201>
  }
  ['/serviceaccounts/search']: {
    /**
     * searchOrgServiceAccountsWithPaging - Search service accounts with paging
     * 
     * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
     * action: `serviceaccounts:read` scope: `serviceaccounts:*`
     */
    'get'(
      parameters?: Parameters<Paths.SearchOrgServiceAccountsWithPaging.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchOrgServiceAccountsWithPaging.Responses.$200>
  }
  ['/serviceaccounts/{serviceAccountId}']: {
    /**
     * deleteServiceAccount - Delete service account
     * 
     * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
     * action: `serviceaccounts:delete` scope: `serviceaccounts:id:1` (single service account)
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteServiceAccount.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteServiceAccount.Responses.$200>
    /**
     * retrieveServiceAccount - Get single serviceaccount by Id
     * 
     * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
     * action: `serviceaccounts:read` scope: `serviceaccounts:id:1` (single service account)
     */
    'get'(
      parameters?: Parameters<Paths.RetrieveServiceAccount.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RetrieveServiceAccount.Responses.$200>
    /**
     * updateServiceAccount - Update service account
     * 
     * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
     * action: `serviceaccounts:write` scope: `serviceaccounts:id:1` (single service account)
     */
    'patch'(
      parameters?: Parameters<Paths.UpdateServiceAccount.PathParameters> | null,
      data?: Paths.UpdateServiceAccount.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateServiceAccount.Responses.$200>
  }
  ['/serviceaccounts/{serviceAccountId}/tokens']: {
    /**
     * listTokens - Get service account tokens
     * 
     * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
     * action: `serviceaccounts:read` scope: `global:serviceaccounts:id:1` (single service account)
     * 
     * Requires basic authentication and that the authenticated user is a Grafana Admin.
     */
    'get'(
      parameters?: Parameters<Paths.ListTokens.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListTokens.Responses.$200>
    /**
     * createToken - CreateNewToken adds a token to a service account
     * 
     * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
     * action: `serviceaccounts:write` scope: `serviceaccounts:id:1` (single service account)
     */
    'post'(
      parameters?: Parameters<Paths.CreateToken.PathParameters> | null,
      data?: Paths.CreateToken.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateToken.Responses.$200>
  }
  ['/serviceaccounts/{serviceAccountId}/tokens/{tokenId}']: {
    /**
     * deleteToken - DeleteToken deletes service account tokens
     * 
     * Required permissions (See note in the [introduction](https://grafana.com/docs/grafana/latest/developers/http_api/serviceaccount/#service-account-api) for an explanation):
     * action: `serviceaccounts:write` scope: `serviceaccounts:id:1` (single service account)
     * 
     * Requires basic authentication and that the authenticated user is a Grafana Admin.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteToken.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteToken.Responses.$200>
  }
  ['/signing-keys/keys']: {
    /**
     * retrieveJWKS - Get JSON Web Key Set (JWKS) with all the keys that can be used to verify tokens (public keys)
     * 
     * Required permissions
     * None
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RetrieveJWKS.Responses.$200>
  }
  ['/snapshot/shared-options']: {
    /**
     * getSharingOptions - Get snapshot sharing settings.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSharingOptions.Responses.$200>
  }
  ['/snapshots']: {
    /**
     * createDashboardSnapshot - When creating a snapshot using the API, you have to provide the full dashboard payload including the snapshot data. This endpoint is designed for the Grafana UI.
     * 
     * Snapshot public mode should be enabled or authentication is required.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateDashboardSnapshot.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateDashboardSnapshot.Responses.$200>
  }
  ['/snapshots-delete/{deleteKey}']: {
    /**
     * deleteDashboardSnapshotByDeleteKey - Delete Snapshot by deleteKey.
     * 
     * Snapshot public mode should be enabled or authentication is required.
     */
    'get'(
      parameters?: Parameters<Paths.DeleteDashboardSnapshotByDeleteKey.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteDashboardSnapshotByDeleteKey.Responses.$200>
  }
  ['/snapshots/{key}']: {
    /**
     * deleteDashboardSnapshot - Delete Snapshot by Key.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteDashboardSnapshot.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteDashboardSnapshot.Responses.$200>
    /**
     * getDashboardSnapshot - Get Snapshot by Key.
     */
    'get'(
      parameters?: Parameters<Paths.GetDashboardSnapshot.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDashboardSnapshot.Responses.$200>
  }
  ['/stats']: {
    /**
     * listDevices - Lists all devices within the last 30 days
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListDevices.Responses.$200>
  }
  ['/teams']: {
    /**
     * createTeam - Add Team.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateTeam.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateTeam.Responses.$200>
  }
  ['/teams/search']: {
    /**
     * searchTeams - Team Search With Paging.
     */
    'get'(
      parameters?: Parameters<Paths.SearchTeams.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchTeams.Responses.$200>
  }
  ['/teams/{teamId}/groups']: {
    /**
     * removeTeamGroupApiQuery - Remove External Group.
     */
    'delete'(
      parameters?: Parameters<Paths.RemoveTeamGroupApiQuery.QueryParameters & Paths.RemoveTeamGroupApiQuery.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RemoveTeamGroupApiQuery.Responses.$200>
    /**
     * getTeamGroupsApi - Get External Groups.
     */
    'get'(
      parameters?: Parameters<Paths.GetTeamGroupsApi.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetTeamGroupsApi.Responses.$200>
    /**
     * addTeamGroupApi - Add External Group.
     */
    'post'(
      parameters?: Parameters<Paths.AddTeamGroupApi.PathParameters> | null,
      data?: Paths.AddTeamGroupApi.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddTeamGroupApi.Responses.$200>
  }
  ['/teams/{team_id}']: {
    /**
     * deleteTeamByID - Delete Team By ID.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteTeamByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteTeamByID.Responses.$200>
    /**
     * getTeamByID - Get Team By ID.
     */
    'get'(
      parameters?: Parameters<Paths.GetTeamByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetTeamByID.Responses.$200>
    /**
     * updateTeam - Update Team.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateTeam.PathParameters> | null,
      data?: Paths.UpdateTeam.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateTeam.Responses.$200>
  }
  ['/teams/{team_id}/members']: {
    /**
     * getTeamMembers - Get Team Members.
     */
    'get'(
      parameters?: Parameters<Paths.GetTeamMembers.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetTeamMembers.Responses.$200>
    /**
     * addTeamMember - Add Team Member.
     */
    'post'(
      parameters?: Parameters<Paths.AddTeamMember.PathParameters> | null,
      data?: Paths.AddTeamMember.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddTeamMember.Responses.$200>
    /**
     * setTeamMemberships - Set team memberships.
     * 
     * Takes user emails, and updates team members and admins to the provided lists of users.
     * Any current team members and admins not in the provided lists will be removed.
     */
    'put'(
      parameters?: Parameters<Paths.SetTeamMemberships.PathParameters> | null,
      data?: Paths.SetTeamMemberships.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetTeamMemberships.Responses.$200>
  }
  ['/teams/{team_id}/members/{user_id}']: {
    /**
     * removeTeamMember - Remove Member From Team.
     */
    'delete'(
      parameters?: Parameters<Paths.RemoveTeamMember.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RemoveTeamMember.Responses.$200>
    /**
     * updateTeamMember - Update Team Member.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateTeamMember.PathParameters> | null,
      data?: Paths.UpdateTeamMember.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateTeamMember.Responses.$200>
  }
  ['/teams/{team_id}/preferences']: {
    /**
     * getTeamPreferences - Get Team Preferences.
     */
    'get'(
      parameters?: Parameters<Paths.GetTeamPreferences.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetTeamPreferences.Responses.$200>
    /**
     * updateTeamPreferences - Update Team Preferences.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateTeamPreferences.PathParameters> | null,
      data?: Paths.UpdateTeamPreferences.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateTeamPreferences.Responses.$200>
  }
  ['/user']: {
    /**
     * getSignedInUser - Get (current authenticated user)
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSignedInUser.Responses.$200>
    /**
     * updateSignedInUser - Update signed in User.
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.UpdateSignedInUser.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateSignedInUser.Responses.$200>
  }
  ['/user/auth-tokens']: {
    /**
     * getUserAuthTokens - Auth tokens of the actual User.
     * 
     * Return a list of all auth tokens (devices) that the actual user currently have logged in from.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUserAuthTokens.Responses.$200>
  }
  ['/user/email/update']: {
    /**
     * updateUserEmail - Update user email.
     * 
     * Update the email of user given a verification code.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/user/helpflags/clear']: {
    /**
     * clearHelpFlags - Clear user help flag.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ClearHelpFlags.Responses.$200>
  }
  ['/user/helpflags/{flag_id}']: {
    /**
     * setHelpFlag - Set user help flag.
     */
    'put'(
      parameters?: Parameters<Paths.SetHelpFlag.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetHelpFlag.Responses.$200>
  }
  ['/user/orgs']: {
    /**
     * getSignedInUserOrgList - Organizations of the actual User.
     * 
     * Return a list of all organizations of the current user.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSignedInUserOrgList.Responses.$200>
  }
  ['/user/password']: {
    /**
     * changeUserPassword - Change Password.
     * 
     * Changes the password for the user.
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.ChangeUserPassword.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ChangeUserPassword.Responses.$200>
  }
  ['/user/preferences']: {
    /**
     * getUserPreferences - Get user preferences.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUserPreferences.Responses.$200>
    /**
     * patchUserPreferences - Patch user preferences.
     */
    'patch'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.PatchUserPreferences.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.PatchUserPreferences.Responses.$200>
    /**
     * updateUserPreferences - Update user preferences.
     * 
     * Omitting a key (`theme`, `homeDashboardId`, `timezone`) will cause the current value to be replaced with the system default value.
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.UpdateUserPreferences.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateUserPreferences.Responses.$200>
  }
  ['/user/quotas']: {
    /**
     * getUserQuotas - Fetch user quota.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUserQuotas.Responses.$200>
  }
  ['/user/revoke-auth-token']: {
    /**
     * revokeUserAuthToken - Revoke an auth token of the actual User.
     * 
     * Revokes the given auth token (device) for the actual user. User of issued auth token (device) will no longer be logged in and will be required to authenticate again upon next activity.
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.RevokeUserAuthToken.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RevokeUserAuthToken.Responses.$200>
  }
  ['/user/stars/dashboard/uid/{dashboard_uid}']: {
    /**
     * unstarDashboardByUID - Unstar a dashboard.
     * 
     * Deletes the starring of the given Dashboard for the actual user.
     */
    'delete'(
      parameters?: Parameters<Paths.UnstarDashboardByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UnstarDashboardByUID.Responses.$200>
    /**
     * starDashboardByUID - Star a dashboard.
     * 
     * Stars the given Dashboard for the actual user.
     */
    'post'(
      parameters?: Parameters<Paths.StarDashboardByUID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.StarDashboardByUID.Responses.$200>
  }
  ['/user/stars/dashboard/{dashboard_id}']: {
    /**
     * unstarDashboard - Unstar a dashboard.
     * 
     * Deletes the starring of the given Dashboard for the actual user.
     */
    'delete'(
      parameters?: Parameters<Paths.UnstarDashboard.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UnstarDashboard.Responses.$200>
    /**
     * starDashboard - Star a dashboard.
     * 
     * Stars the given Dashboard for the actual user.
     */
    'post'(
      parameters?: Parameters<Paths.StarDashboard.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.StarDashboard.Responses.$200>
  }
  ['/user/teams']: {
    /**
     * getSignedInUserTeamList - Teams that the actual User is member of.
     * 
     * Return a list of all teams that the current user is member of.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSignedInUserTeamList.Responses.$200>
  }
  ['/user/using/{org_id}']: {
    /**
     * userSetUsingOrg - Switch user context for signed in user.
     * 
     * Switch user context to the given organization.
     */
    'post'(
      parameters?: Parameters<Paths.UserSetUsingOrg.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UserSetUsingOrg.Responses.$200>
  }
  ['/users']: {
    /**
     * searchUsers - Get users.
     * 
     * Returns all users that the authenticated user has permission to view, admin permission required.
     */
    'get'(
      parameters?: Parameters<Paths.SearchUsers.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchUsers.Responses.$200>
  }
  ['/users/lookup']: {
    /**
     * getUserByLoginOrEmail - Get user by login or email.
     */
    'get'(
      parameters?: Parameters<Paths.GetUserByLoginOrEmail.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUserByLoginOrEmail.Responses.$200>
  }
  ['/users/search']: {
    /**
     * searchUsersWithPaging - Get users with paging.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SearchUsersWithPaging.Responses.$200>
  }
  ['/users/{user_id}']: {
    /**
     * getUserByID - Get user by id.
     */
    'get'(
      parameters?: Parameters<Paths.GetUserByID.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUserByID.Responses.$200>
    /**
     * updateUser - Update user.
     * 
     * Update the user identified by id.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateUser.PathParameters> | null,
      data?: Paths.UpdateUser.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateUser.Responses.$200>
  }
  ['/users/{user_id}/orgs']: {
    /**
     * getUserOrgList - Get organizations for user.
     * 
     * Get organizations for user identified by id.
     */
    'get'(
      parameters?: Parameters<Paths.GetUserOrgList.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUserOrgList.Responses.$200>
  }
  ['/users/{user_id}/teams']: {
    /**
     * getUserTeams - Get teams for user.
     * 
     * Get teams for user identified by id.
     */
    'get'(
      parameters?: Parameters<Paths.GetUserTeams.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUserTeams.Responses.$200>
  }
  ['/v1/provisioning/alert-rules']: {
    /**
     * RouteGetAlertRules - Get all the alert rules.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetAlertRules.Responses.$200>
    /**
     * RoutePostAlertRule - Create a new alert rule.
     */
    'post'(
      parameters?: Parameters<Paths.RoutePostAlertRule.HeaderParameters> | null,
      data?: Paths.RoutePostAlertRule.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RoutePostAlertRule.Responses.$201>
  }
  ['/v1/provisioning/alert-rules/export']: {
    /**
     * RouteGetAlertRulesExport - Export all alert rules in provisioning file format.
     */
    'get'(
      parameters?: Parameters<Paths.RouteGetAlertRulesExport.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetAlertRulesExport.Responses.$200>
  }
  ['/v1/provisioning/alert-rules/{UID}']: {
    /**
     * RouteDeleteAlertRule - Delete a specific alert rule by UID.
     */
    'delete'(
      parameters?: Parameters<Paths.RouteDeleteAlertRule.HeaderParameters & Paths.RouteDeleteAlertRule.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteDeleteAlertRule.Responses.$204>
    /**
     * RouteGetAlertRule - Get a specific alert rule by UID.
     */
    'get'(
      parameters?: Parameters<Paths.RouteGetAlertRule.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetAlertRule.Responses.$200>
    /**
     * RoutePutAlertRule - Update an existing alert rule.
     */
    'put'(
      parameters?: Parameters<Paths.RoutePutAlertRule.HeaderParameters & Paths.RoutePutAlertRule.PathParameters> | null,
      data?: Paths.RoutePutAlertRule.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RoutePutAlertRule.Responses.$200>
  }
  ['/v1/provisioning/alert-rules/{UID}/export']: {
    /**
     * RouteGetAlertRuleExport - Export an alert rule in provisioning file format.
     */
    'get'(
      parameters?: Parameters<Paths.RouteGetAlertRuleExport.QueryParameters & Paths.RouteGetAlertRuleExport.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetAlertRuleExport.Responses.$200>
  }
  ['/v1/provisioning/contact-points']: {
    /**
     * RouteGetContactpoints - Get all the contact points.
     */
    'get'(
      parameters?: Parameters<Paths.RouteGetContactpoints.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetContactpoints.Responses.$200>
    /**
     * RoutePostContactpoints - Create a contact point.
     */
    'post'(
      parameters?: Parameters<Paths.RoutePostContactpoints.HeaderParameters> | null,
      data?: Paths.RoutePostContactpoints.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RoutePostContactpoints.Responses.$202>
  }
  ['/v1/provisioning/contact-points/export']: {
    /**
     * RouteGetContactpointsExport - Export all contact points in provisioning file format.
     */
    'get'(
      parameters?: Parameters<Paths.RouteGetContactpointsExport.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetContactpointsExport.Responses.$200>
  }
  ['/v1/provisioning/contact-points/{UID}']: {
    /**
     * RouteDeleteContactpoints - Delete a contact point.
     */
    'delete'(
      parameters?: Parameters<Paths.RouteDeleteContactpoints.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteDeleteContactpoints.Responses.$202>
    /**
     * RoutePutContactpoint - Update an existing contact point.
     */
    'put'(
      parameters?: Parameters<Paths.RoutePutContactpoint.HeaderParameters & Paths.RoutePutContactpoint.PathParameters> | null,
      data?: Paths.RoutePutContactpoint.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RoutePutContactpoint.Responses.$202>
  }
  ['/v1/provisioning/folder/{FolderUID}/rule-groups/{Group}']: {
    /**
     * RouteDeleteAlertRuleGroup - Delete rule group
     */
    'delete'(
      parameters?: Parameters<Paths.RouteDeleteAlertRuleGroup.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteDeleteAlertRuleGroup.Responses.$204>
    /**
     * RouteGetAlertRuleGroup - Get a rule group.
     */
    'get'(
      parameters?: Parameters<Paths.RouteGetAlertRuleGroup.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetAlertRuleGroup.Responses.$200>
    /**
     * RoutePutAlertRuleGroup - Create or update alert rule group.
     */
    'put'(
      parameters?: Parameters<Paths.RoutePutAlertRuleGroup.HeaderParameters & Paths.RoutePutAlertRuleGroup.PathParameters> | null,
      data?: Paths.RoutePutAlertRuleGroup.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RoutePutAlertRuleGroup.Responses.$200>
  }
  ['/v1/provisioning/folder/{FolderUID}/rule-groups/{Group}/export']: {
    /**
     * RouteGetAlertRuleGroupExport - Export an alert rule group in provisioning file format.
     */
    'get'(
      parameters?: Parameters<Paths.RouteGetAlertRuleGroupExport.QueryParameters & Paths.RouteGetAlertRuleGroupExport.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetAlertRuleGroupExport.Responses.$200>
  }
  ['/v1/provisioning/mute-timings']: {
    /**
     * RouteGetMuteTimings - Get all the mute timings.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetMuteTimings.Responses.$200>
    /**
     * RoutePostMuteTiming - Create a new mute timing.
     */
    'post'(
      parameters?: Parameters<Paths.RoutePostMuteTiming.HeaderParameters> | null,
      data?: Paths.RoutePostMuteTiming.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RoutePostMuteTiming.Responses.$201>
  }
  ['/v1/provisioning/mute-timings/export']: {
    /**
     * RouteExportMuteTimings - Export all mute timings in provisioning format.
     */
    'get'(
      parameters?: Parameters<Paths.RouteExportMuteTimings.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteExportMuteTimings.Responses.$200>
  }
  ['/v1/provisioning/mute-timings/{name}']: {
    /**
     * RouteDeleteMuteTiming - Delete a mute timing.
     */
    'delete'(
      parameters?: Parameters<Paths.RouteDeleteMuteTiming.QueryParameters & Paths.RouteDeleteMuteTiming.HeaderParameters & Paths.RouteDeleteMuteTiming.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteDeleteMuteTiming.Responses.$204>
    /**
     * RouteGetMuteTiming - Get a mute timing.
     */
    'get'(
      parameters?: Parameters<Paths.RouteGetMuteTiming.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetMuteTiming.Responses.$200>
    /**
     * RoutePutMuteTiming - Replace an existing mute timing.
     */
    'put'(
      parameters?: Parameters<Paths.RoutePutMuteTiming.HeaderParameters & Paths.RoutePutMuteTiming.PathParameters> | null,
      data?: Paths.RoutePutMuteTiming.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RoutePutMuteTiming.Responses.$202>
  }
  ['/v1/provisioning/mute-timings/{name}/export']: {
    /**
     * RouteExportMuteTiming - Export a mute timing in provisioning format.
     */
    'get'(
      parameters?: Parameters<Paths.RouteExportMuteTiming.QueryParameters & Paths.RouteExportMuteTiming.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteExportMuteTiming.Responses.$200>
  }
  ['/v1/provisioning/policies']: {
    /**
     * RouteResetPolicyTree - Clears the notification policy tree.
     */
    'delete'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteResetPolicyTree.Responses.$202>
    /**
     * RouteGetPolicyTree - Get the notification policy tree.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetPolicyTree.Responses.$200>
    /**
     * RoutePutPolicyTree - Sets the notification policy tree.
     */
    'put'(
      parameters?: Parameters<Paths.RoutePutPolicyTree.HeaderParameters> | null,
      data?: Paths.RoutePutPolicyTree.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RoutePutPolicyTree.Responses.$202>
  }
  ['/v1/provisioning/policies/export']: {
    /**
     * RouteGetPolicyTreeExport - Export the notification policy tree in provisioning file format.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetPolicyTreeExport.Responses.$200>
  }
  ['/v1/provisioning/templates']: {
    /**
     * RouteGetTemplates - Get all notification template groups.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetTemplates.Responses.$200>
  }
  ['/v1/provisioning/templates/{name}']: {
    /**
     * RouteDeleteTemplate - Delete a notification template group.
     */
    'delete'(
      parameters?: Parameters<Paths.RouteDeleteTemplate.QueryParameters & Paths.RouteDeleteTemplate.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteDeleteTemplate.Responses.$204>
    /**
     * RouteGetTemplate - Get a notification template group.
     */
    'get'(
      parameters?: Parameters<Paths.RouteGetTemplate.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RouteGetTemplate.Responses.$200>
    /**
     * RoutePutTemplate - Updates an existing notification template group.
     */
    'put'(
      parameters?: Parameters<Paths.RoutePutTemplate.HeaderParameters & Paths.RoutePutTemplate.PathParameters> | null,
      data?: Paths.RoutePutTemplate.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RoutePutTemplate.Responses.$202>
  }
  ['/v1/sso-settings']: {
    /**
     * listAllProvidersSettings - List all SSO Settings entries
     * 
     * You need to have a permission with action `settings:read` with scope `settings:auth.<provider>:*`.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListAllProvidersSettings.Responses.$200>
  }
  ['/v1/sso-settings/{key}']: {
    /**
     * removeProviderSettings - Remove SSO Settings
     * 
     * Removes the SSO Settings for a provider.
     * 
     * You need to have a permission with action `settings:write` and scope `settings:auth.<provider>:*`.
     */
    'delete'(
      parameters?: Parameters<Paths.RemoveProviderSettings.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.RemoveProviderSettings.Responses.$204>
    /**
     * getProviderSettings - Get an SSO Settings entry by Key
     * 
     * You need to have a permission with action `settings:read` with scope `settings:auth.<provider>:*`.
     */
    'get'(
      parameters?: Parameters<Paths.GetProviderSettings.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetProviderSettings.Responses.$200>
    /**
     * updateProviderSettings - Update SSO Settings
     * 
     * Inserts or updates the SSO Settings for a provider.
     * 
     * You need to have a permission with action `settings:write` and scope `settings:auth.<provider>:*`.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateProviderSettings.PathParameters> | null,
      data?: Paths.UpdateProviderSettings.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateProviderSettings.Responses.$204>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>

export type Ack = Components.Schemas.Ack;
export type ActiveSyncStatusDTO = Components.Schemas.ActiveSyncStatusDTO;
export type ActiveUserStats = Components.Schemas.ActiveUserStats;
export type AddAPIKeyCommand = Components.Schemas.AddAPIKeyCommand;
export type AddDataSourceCommand = Components.Schemas.AddDataSourceCommand;
export type AddInviteForm = Components.Schemas.AddInviteForm;
export type AddOrgUserCommand = Components.Schemas.AddOrgUserCommand;
export type AddServiceAccountTokenCommand = Components.Schemas.AddServiceAccountTokenCommand;
export type AddTeamMemberCommand = Components.Schemas.AddTeamMemberCommand;
export type AddTeamRoleCommand = Components.Schemas.AddTeamRoleCommand;
export type AddUserRoleCommand = Components.Schemas.AddUserRoleCommand;
export type Address = Components.Schemas.Address;
export type AdminCreateUserForm = Components.Schemas.AdminCreateUserForm;
export type AdminCreateUserResponse = Components.Schemas.AdminCreateUserResponse;
export type AdminStats = Components.Schemas.AdminStats;
export type AdminUpdateUserPasswordForm = Components.Schemas.AdminUpdateUserPasswordForm;
export type AdminUpdateUserPermissionsForm = Components.Schemas.AdminUpdateUserPermissionsForm;
export type alert = Components.Schemas.Alert;
export type AlertDiscovery = Components.Schemas.AlertDiscovery;
export type alertGroup = Components.Schemas.AlertGroup;
export type alertGroups = Components.Schemas.AlertGroups;
export type AlertInstancesResponse = Components.Schemas.AlertInstancesResponse;
export type AlertManager = Components.Schemas.AlertManager;
export type AlertManagerNotReady = Components.Schemas.AlertManagerNotReady;
export type AlertManagersResult = Components.Schemas.AlertManagersResult;
export type AlertQuery = Components.Schemas.AlertQuery;
export type AlertQueryExport = Components.Schemas.AlertQueryExport;
export type AlertResponse = Components.Schemas.AlertResponse;
export type AlertRuleEditorSettings = Components.Schemas.AlertRuleEditorSettings;
export type AlertRuleExport = Components.Schemas.AlertRuleExport;
export type AlertRuleGroup = Components.Schemas.AlertRuleGroup;
export type AlertRuleGroupExport = Components.Schemas.AlertRuleGroupExport;
export type AlertRuleGroupMetadata = Components.Schemas.AlertRuleGroupMetadata;
export type AlertRuleMetadata = Components.Schemas.AlertRuleMetadata;
export type AlertRuleNotificationSettings = Components.Schemas.AlertRuleNotificationSettings;
export type AlertRuleNotificationSettingsExport = Components.Schemas.AlertRuleNotificationSettingsExport;
export type AlertRuleRecordExport = Components.Schemas.AlertRuleRecordExport;
export type alertStatus = Components.Schemas.AlertStatus;
export type AlertingFileExport = Components.Schemas.AlertingFileExport;
export type AlertingRule = Components.Schemas.AlertingRule;
export type AlertingStatus = Components.Schemas.AlertingStatus;
export type alertmanagerConfig = Components.Schemas.AlertmanagerConfig;
export type alertmanagerStatus = Components.Schemas.AlertmanagerStatus;
export type Annotation = Components.Schemas.Annotation;
export type AnnotationActions = Components.Schemas.AnnotationActions;
export type AnnotationEvent = Components.Schemas.AnnotationEvent;
export type AnnotationPanelFilter = Components.Schemas.AnnotationPanelFilter;
export type AnnotationPermission = Components.Schemas.AnnotationPermission;
export type AnnotationQuery = Components.Schemas.AnnotationQuery;
export type AnnotationTarget = Components.Schemas.AnnotationTarget;
export type ApiKeyDTO = Components.Schemas.ApiKeyDTO;
export type ApiRuleNode = Components.Schemas.ApiRuleNode;
export type Assignments = Components.Schemas.Assignments;
export type AttributeTypeAndValue = Components.Schemas.AttributeTypeAndValue;
export type Authorization = Components.Schemas.Authorization;
export type BacktestConfig = Components.Schemas.BacktestConfig;
export type BacktestResult = Components.Schemas.BacktestResult;
export type BasicAuth = Components.Schemas.BasicAuth;
export type CacheConfig = Components.Schemas.CacheConfig;
export type CacheConfigResponse = Components.Schemas.CacheConfigResponse;
export type CacheConfigSetter = Components.Schemas.CacheConfigSetter;
export type CalculateDiffTarget = Components.Schemas.CalculateDiffTarget;
export type Certificate = Components.Schemas.Certificate;
export type ChangeUserPasswordCommand = Components.Schemas.ChangeUserPasswordCommand;
export type CloudMigrationRunListDTO = Components.Schemas.CloudMigrationRunListDTO;
export type CloudMigrationSessionListResponseDTO = Components.Schemas.CloudMigrationSessionListResponseDTO;
export type CloudMigrationSessionRequestDTO = Components.Schemas.CloudMigrationSessionRequestDTO;
export type CloudMigrationSessionResponseDTO = Components.Schemas.CloudMigrationSessionResponseDTO;
export type clusterStatus = Components.Schemas.ClusterStatus;
export type ConfFloat64 = Components.Schemas.ConfFloat64;
export type Config = Components.Schemas.Config;
export type ContactPointExport = Components.Schemas.ContactPointExport;
export type ContactPoints = Components.Schemas.ContactPoints;
export type ConvertPrometheusResponse = Components.Schemas.ConvertPrometheusResponse;
export type CookiePreferences = Components.Schemas.CookiePreferences;
export type CookieType = Components.Schemas.CookieType;
export type Correlation = Components.Schemas.Correlation;
export type CorrelationConfig = Components.Schemas.CorrelationConfig;
export type CorrelationConfigUpdateDTO = Components.Schemas.CorrelationConfigUpdateDTO;
export type CorrelationType = Components.Schemas.CorrelationType;
export type CounterResetHint = Components.Schemas.CounterResetHint;
export type CreateAccessTokenResponseDTO = Components.Schemas.CreateAccessTokenResponseDTO;
export type CreateCorrelationCommand = Components.Schemas.CreateCorrelationCommand;
export type CreateCorrelationResponseBody = Components.Schemas.CreateCorrelationResponseBody;
export type CreateDashboardSnapshotCommand = Components.Schemas.CreateDashboardSnapshotCommand;
export type CreateFolderCommand = Components.Schemas.CreateFolderCommand;
export type CreateLibraryElementCommand = Components.Schemas.CreateLibraryElementCommand;
export type CreateOrUpdateReport = Components.Schemas.CreateOrUpdateReport;
export type CreateOrgCommand = Components.Schemas.CreateOrgCommand;
export type CreatePlaylistCommand = Components.Schemas.CreatePlaylistCommand;
export type CreateQueryInQueryHistoryCommand = Components.Schemas.CreateQueryInQueryHistoryCommand;
export type CreateRoleForm = Components.Schemas.CreateRoleForm;
export type CreateServiceAccountForm = Components.Schemas.CreateServiceAccountForm;
export type CreateSnapshotResponseDTO = Components.Schemas.CreateSnapshotResponseDTO;
export type CreateTeamCommand = Components.Schemas.CreateTeamCommand;
export type DashboardACLInfoDTO = Components.Schemas.DashboardACLInfoDTO;
export type DashboardACLUpdateItem = Components.Schemas.DashboardACLUpdateItem;
export type DashboardCreateCommand = Components.Schemas.DashboardCreateCommand;
export type DashboardFullWithMeta = Components.Schemas.DashboardFullWithMeta;
export type DashboardMeta = Components.Schemas.DashboardMeta;
export type DashboardRedirect = Components.Schemas.DashboardRedirect;
export type DashboardSnapshotDTO = Components.Schemas.DashboardSnapshotDTO;
export type DashboardTagCloudItem = Components.Schemas.DashboardTagCloudItem;
export type DashboardVersionMeta = Components.Schemas.DashboardVersionMeta;
export type DataLink = Components.Schemas.DataLink;
export type DataResponse = Components.Schemas.DataResponse;
export type DataSource = Components.Schemas.DataSource;
export type DataSourceList = Components.Schemas.DataSourceList;
export type DataSourceListItemDTO = Components.Schemas.DataSourceListItemDTO;
export type DataSourceRef = Components.Schemas.DataSourceRef;
export type DataTopic = Components.Schemas.DataTopic;
export type DeleteCorrelationResponseBody = Components.Schemas.DeleteCorrelationResponseBody;
export type DeleteTokenCommand = Components.Schemas.DeleteTokenCommand;
export type DescendantCounts = Components.Schemas.DescendantCounts;
export type Description = Components.Schemas.Description;
export type deviceDTO = Components.Schemas.DeviceDTO;
export type DeviceSearchHitDTO = Components.Schemas.DeviceSearchHitDTO;
export type DiscordConfig = Components.Schemas.DiscordConfig;
export type DiscoveryBase = Components.Schemas.DiscoveryBase;
export type DsAccess = Components.Schemas.DsAccess;
export type DsPermissionType = Components.Schemas.DsPermissionType;
export type Duration = Components.Schemas.Duration;
export type EmailConfig = Components.Schemas.EmailConfig;
export type EmailDTO = Components.Schemas.EmailDTO;
export type EmbeddedContactPoint = Components.Schemas.EmbeddedContactPoint;
export type EnumFieldConfig = Components.Schemas.EnumFieldConfig;
export type ErrorResponseBody = Components.Schemas.ErrorResponseBody;
export type ErrorType = Components.Schemas.ErrorType;
export type EvalAlertConditionCommand = Components.Schemas.EvalAlertConditionCommand;
export type EvalQueriesPayload = Components.Schemas.EvalQueriesPayload;
export type EvalQueriesResponse = Components.Schemas.EvalQueriesResponse;
export type ExplorePanelsState = Components.Schemas.ExplorePanelsState;
export type ExtKeyUsage = Components.Schemas.ExtKeyUsage;
export type ExtendedReceiver = Components.Schemas.ExtendedReceiver;
export type Extension = Components.Schemas.Extension;
export type FailedUser = Components.Schemas.FailedUser;
export type Failure = Components.Schemas.Failure;
export type Field = Components.Schemas.Field;
export type FieldConfig = Components.Schemas.FieldConfig;
export type FieldTypeConfig = Components.Schemas.FieldTypeConfig;
export type FindTagsResult = Components.Schemas.FindTagsResult;
export type FloatHistogram = Components.Schemas.FloatHistogram;
export type Folder = Components.Schemas.Folder;
export type FolderSearchHit = Components.Schemas.FolderSearchHit;
export type ForbiddenError = Components.Schemas.ForbiddenError;
export type Frame = Components.Schemas.Frame;
export type FrameLabels = Components.Schemas.FrameLabels;
export type FrameMeta = Components.Schemas.FrameMeta;
export type FrameType = Components.Schemas.FrameType;
export type FrameTypeVersion = Components.Schemas.FrameTypeVersion;
export type Frames = Components.Schemas.Frames;
export type GetAccessTokenResponseDTO = Components.Schemas.GetAccessTokenResponseDTO;
export type GetAnnotationTagsResponse = Components.Schemas.GetAnnotationTagsResponse;
export type getGroupsResponse = Components.Schemas.GetGroupsResponse;
export type GetHomeDashboardResponse = Components.Schemas.GetHomeDashboardResponse;
export type GetSnapshotResponseDTO = Components.Schemas.GetSnapshotResponseDTO;
export type gettableAlert = Components.Schemas.GettableAlert;
export type GettableAlertmanagers = Components.Schemas.GettableAlertmanagers;
export type gettableAlerts = Components.Schemas.GettableAlerts;
export type GettableApiAlertingConfig = Components.Schemas.GettableApiAlertingConfig;
export type GettableApiReceiver = Components.Schemas.GettableApiReceiver;
export type GettableExtendedRuleNode = Components.Schemas.GettableExtendedRuleNode;
export type GettableGrafanaReceiver = Components.Schemas.GettableGrafanaReceiver;
export type GettableGrafanaReceivers = Components.Schemas.GettableGrafanaReceivers;
export type GettableGrafanaRule = Components.Schemas.GettableGrafanaRule;
export type gettableGrafanaSilence = Components.Schemas.GettableGrafanaSilence;
export type gettableGrafanaSilences = Components.Schemas.GettableGrafanaSilences;
export type GettableHistoricUserConfig = Components.Schemas.GettableHistoricUserConfig;
export type GettableNGalertConfig = Components.Schemas.GettableNGalertConfig;
export type GettableRuleGroupConfig = Components.Schemas.GettableRuleGroupConfig;
export type GettableRuleVersions = Components.Schemas.GettableRuleVersions;
export type gettableSilence = Components.Schemas.GettableSilence;
export type gettableSilences = Components.Schemas.GettableSilences;
export type GettableStatus = Components.Schemas.GettableStatus;
export type GettableTimeIntervals = Components.Schemas.GettableTimeIntervals;
export type GettableUserConfig = Components.Schemas.GettableUserConfig;
export type GlobalConfig = Components.Schemas.GlobalConfig;
export type Group = Components.Schemas.Group;
export type GroupAttributes = Components.Schemas.GroupAttributes;
export type HTTPClientConfig = Components.Schemas.HTTPClientConfig;
export type Header = Components.Schemas.Header;
export type Headers = Components.Schemas.Headers;
export type healthResponse = Components.Schemas.HealthResponse;
export type Hit = Components.Schemas.Hit;
export type HitList = Components.Schemas.HitList;
export type HitType = Components.Schemas.HitType;
export type HostPort = Components.Schemas.HostPort;
export type IPMask = Components.Schemas.IPMask;
export type IPNet = Components.Schemas.IPNet;
export type ImportDashboardInput = Components.Schemas.ImportDashboardInput;
export type ImportDashboardRequest = Components.Schemas.ImportDashboardRequest;
export type ImportDashboardResponse = Components.Schemas.ImportDashboardResponse;
export type InhibitRule = Components.Schemas.InhibitRule;
export type InspectType = Components.Schemas.InspectType;
export type InternalDataLink = Components.Schemas.InternalDataLink;
export type JSONWebKey = Components.Schemas.JSONWebKey;
export type Json = Components.Schemas.Json;
export type KeyUsage = Components.Schemas.KeyUsage;
export type Label = Components.Schemas.Label;
export type LabelName = Components.Schemas.LabelName;
export type LabelNames = Components.Schemas.LabelNames;
export type labelSet = Components.Schemas.LabelSet;
export type LabelValue = Components.Schemas.LabelValue;
export type Labels = Components.Schemas.Labels;
export type LibraryElementArrayResponse = Components.Schemas.LibraryElementArrayResponse;
export type LibraryElementConnectionDTO = Components.Schemas.LibraryElementConnectionDTO;
export type LibraryElementConnectionsResponse = Components.Schemas.LibraryElementConnectionsResponse;
export type LibraryElementDTO = Components.Schemas.LibraryElementDTO;
export type LibraryElementDTOMeta = Components.Schemas.LibraryElementDTOMeta;
export type LibraryElementDTOMetaUser = Components.Schemas.LibraryElementDTOMetaUser;
export type LibraryElementResponse = Components.Schemas.LibraryElementResponse;
export type LibraryElementSearchResponse = Components.Schemas.LibraryElementSearchResponse;
export type LibraryElementSearchResult = Components.Schemas.LibraryElementSearchResult;
export type LinkTransformationConfig = Components.Schemas.LinkTransformationConfig;
export type MSTeamsConfig = Components.Schemas.MSTeamsConfig;
export type ManagerKind = Components.Schemas.ManagerKind;
export type MassDeleteAnnotationsCmd = Components.Schemas.MassDeleteAnnotationsCmd;
export type MatchRegexps = Components.Schemas.MatchRegexps;
export type MatchType = Components.Schemas.MatchType;
export type matcher = Components.Schemas.Matcher;
export type matchers = Components.Schemas.Matchers;
export type messageResponse = Components.Schemas.MessageResponse;
export type Metadata = Components.Schemas.Metadata;
export type MetricRequest = Components.Schemas.MetricRequest;
export type MigrateDataResponseDTO = Components.Schemas.MigrateDataResponseDTO;
export type MigrateDataResponseItemDTO = Components.Schemas.MigrateDataResponseItemDTO;
export type MigrateDataResponseListDTO = Components.Schemas.MigrateDataResponseListDTO;
export type MoveFolderCommand = Components.Schemas.MoveFolderCommand;
export type MultiStatus = Components.Schemas.MultiStatus;
export type MuteTimeInterval = Components.Schemas.MuteTimeInterval;
export type MuteTimeIntervalExport = Components.Schemas.MuteTimeIntervalExport;
export type MuteTimings = Components.Schemas.MuteTimings;
export type Name = Components.Schemas.Name;
export type NamespaceConfigResponse = Components.Schemas.NamespaceConfigResponse;
export type NavbarPreference = Components.Schemas.NavbarPreference;
export type NewApiKeyResult = Components.Schemas.NewApiKeyResult;
export type NotFound = Components.Schemas.NotFound;
export type Notice = Components.Schemas.Notice;
export type NoticeSeverity = Components.Schemas.NoticeSeverity;
export type NotificationPolicyExport = Components.Schemas.NotificationPolicyExport;
export type NotificationTemplate = Components.Schemas.NotificationTemplate;
export type NotificationTemplateContent = Components.Schemas.NotificationTemplateContent;
export type NotificationTemplates = Components.Schemas.NotificationTemplates;
export type NotifierConfig = Components.Schemas.NotifierConfig;
export type OAuth2 = Components.Schemas.OAuth2;
export type ObjectIdentifier = Components.Schemas.ObjectIdentifier;
export type ObjectMatcher = Components.Schemas.ObjectMatcher;
export type ObjectMatchers = Components.Schemas.ObjectMatchers;
export type OpsGenieConfig = Components.Schemas.OpsGenieConfig;
export type OpsGenieConfigResponder = Components.Schemas.OpsGenieConfigResponder;
export type OrgDTO = Components.Schemas.OrgDTO;
export type OrgDetailsDTO = Components.Schemas.OrgDetailsDTO;
export type OrgUserDTO = Components.Schemas.OrgUserDTO;
export type PagerdutyConfig = Components.Schemas.PagerdutyConfig;
export type PagerdutyImage = Components.Schemas.PagerdutyImage;
export type PagerdutyLink = Components.Schemas.PagerdutyLink;
export type Password = Components.Schemas.Password;
export type PatchAnnotationsCmd = Components.Schemas.PatchAnnotationsCmd;
export type PatchLibraryElementCommand = Components.Schemas.PatchLibraryElementCommand;
export type PatchPrefsCmd = Components.Schemas.PatchPrefsCmd;
export type PatchQueryCommentInQueryHistoryCommand = Components.Schemas.PatchQueryCommentInQueryHistoryCommand;
export type peerStatus = Components.Schemas.PeerStatus;
export type Permission = Components.Schemas.Permission;
export type PermissionDenied = Components.Schemas.PermissionDenied;
export type PermissionType = Components.Schemas.PermissionType;
export type Playlist = Components.Schemas.Playlist;
export type PlaylistDTO = Components.Schemas.PlaylistDTO;
export type PlaylistDashboard = Components.Schemas.PlaylistDashboard;
export type PlaylistDashboardsSlice = Components.Schemas.PlaylistDashboardsSlice;
export type PlaylistItem = Components.Schemas.PlaylistItem;
export type PlaylistItemDTO = Components.Schemas.PlaylistItemDTO;
export type Playlists = Components.Schemas.Playlists;
export type PolicyMapping = Components.Schemas.PolicyMapping;
export type PostAnnotationsCmd = Components.Schemas.PostAnnotationsCmd;
export type PostGraphiteAnnotationsCmd = Components.Schemas.PostGraphiteAnnotationsCmd;
export type postSilencesOKBody = Components.Schemas.PostSilencesOKBody;
export type postableAlert = Components.Schemas.PostableAlert;
export type postableAlerts = Components.Schemas.PostableAlerts;
export type PostableApiAlertingConfig = Components.Schemas.PostableApiAlertingConfig;
export type PostableApiReceiver = Components.Schemas.PostableApiReceiver;
export type PostableExtendedRuleNode = Components.Schemas.PostableExtendedRuleNode;
export type PostableExtendedRuleNodeExtended = Components.Schemas.PostableExtendedRuleNodeExtended;
export type PostableGrafanaReceiver = Components.Schemas.PostableGrafanaReceiver;
export type PostableGrafanaReceivers = Components.Schemas.PostableGrafanaReceivers;
export type PostableGrafanaRule = Components.Schemas.PostableGrafanaRule;
export type PostableNGalertConfig = Components.Schemas.PostableNGalertConfig;
export type PostableRuleGroupConfig = Components.Schemas.PostableRuleGroupConfig;
export type postableSilence = Components.Schemas.PostableSilence;
export type PostableTimeIntervals = Components.Schemas.PostableTimeIntervals;
export type PostableUserConfig = Components.Schemas.PostableUserConfig;
export type Preferences = Components.Schemas.Preferences;
export type PrometheusNamespace = Components.Schemas.PrometheusNamespace;
export type PrometheusRemoteWriteTargetJSON = Components.Schemas.PrometheusRemoteWriteTargetJSON;
export type PrometheusRule = Components.Schemas.PrometheusRule;
export type PrometheusRuleGroup = Components.Schemas.PrometheusRuleGroup;
export type Provenance = Components.Schemas.Provenance;
export type ProvisionedAlertRule = Components.Schemas.ProvisionedAlertRule;
export type ProvisionedAlertRules = Components.Schemas.ProvisionedAlertRules;
export type ProxyConfig = Components.Schemas.ProxyConfig;
export type ProxyHeader = Components.Schemas.ProxyHeader;
export type PublicDashboard = Components.Schemas.PublicDashboard;
export type PublicDashboardDTO = Components.Schemas.PublicDashboardDTO;
export type PublicDashboardListResponse = Components.Schemas.PublicDashboardListResponse;
export type PublicDashboardListResponseWithPagination = Components.Schemas.PublicDashboardListResponseWithPagination;
export type publicError = Components.Schemas.PublicError;
export type PublicKeyAlgorithm = Components.Schemas.PublicKeyAlgorithm;
export type PushoverConfig = Components.Schemas.PushoverConfig;
export type QueryDataResponse = Components.Schemas.QueryDataResponse;
export type QueryHistoryDTO = Components.Schemas.QueryHistoryDTO;
export type QueryHistoryDeleteQueryResponse = Components.Schemas.QueryHistoryDeleteQueryResponse;
export type QueryHistoryPreference = Components.Schemas.QueryHistoryPreference;
export type QueryHistoryResponse = Components.Schemas.QueryHistoryResponse;
export type QueryHistorySearchResponse = Components.Schemas.QueryHistorySearchResponse;
export type QueryHistorySearchResult = Components.Schemas.QueryHistorySearchResult;
export type QueryStat = Components.Schemas.QueryStat;
export type QuotaDTO = Components.Schemas.QuotaDTO;
export type RawMessage = Components.Schemas.RawMessage;
export type receiver = Components.Schemas.Receiver;
export type ReceiverExport = Components.Schemas.ReceiverExport;
export type Record = Components.Schemas.Record;
export type RecordingRuleJSON = Components.Schemas.RecordingRuleJSON;
export type RelativeTimeRange = Components.Schemas.RelativeTimeRange;
export type RelativeTimeRangeExport = Components.Schemas.RelativeTimeRangeExport;
export type Report = Components.Schemas.Report;
export type ReportBrandingOptions = Components.Schemas.ReportBrandingOptions;
export type ReportDashboard = Components.Schemas.ReportDashboard;
export type ReportDashboardID = Components.Schemas.ReportDashboardID;
export type ReportEmail = Components.Schemas.ReportEmail;
export type ReportOptions = Components.Schemas.ReportOptions;
export type ReportSchedule = Components.Schemas.ReportSchedule;
export type ReportSettings = Components.Schemas.ReportSettings;
export type ReportTimeRange = Components.Schemas.ReportTimeRange;
export type resourcePermissionDTO = Components.Schemas.ResourcePermissionDTO;
export type ResponseDetails = Components.Schemas.ResponseDetails;
export type Responses = Components.Schemas.Responses;
export type RestoreDashboardVersionCommand = Components.Schemas.RestoreDashboardVersionCommand;
export type RestoreDeletedDashboardCommand = Components.Schemas.RestoreDeletedDashboardCommand;
export type RevokeAuthTokenCmd = Components.Schemas.RevokeAuthTokenCmd;
export type RoleAssignmentsDTO = Components.Schemas.RoleAssignmentsDTO;
export type RoleDTO = Components.Schemas.RoleDTO;
export type RolesSearchQuery = Components.Schemas.RolesSearchQuery;
export type Route = Components.Schemas.Route;
export type RouteExport = Components.Schemas.RouteExport;
export type Rule = Components.Schemas.Rule;
export type RuleDiscovery = Components.Schemas.RuleDiscovery;
export type RuleGroup = Components.Schemas.RuleGroup;
export type RuleGroupConfigResponse = Components.Schemas.RuleGroupConfigResponse;
export type RuleResponse = Components.Schemas.RuleResponse;
export type SNSConfig = Components.Schemas.SNSConfig;
export type Sample = Components.Schemas.Sample;
export type SaveDashboardCommand = Components.Schemas.SaveDashboardCommand;
export type SearchDTO = Components.Schemas.SearchDTO;
export type SearchDeviceQueryResult = Components.Schemas.SearchDeviceQueryResult;
export type SearchOrgServiceAccountsResult = Components.Schemas.SearchOrgServiceAccountsResult;
export type SearchOrgUsersQueryResult = Components.Schemas.SearchOrgUsersQueryResult;
export type SearchResult = Components.Schemas.SearchResult;
export type SearchResultItem = Components.Schemas.SearchResultItem;
export type SearchTeamQueryResult = Components.Schemas.SearchTeamQueryResult;
export type SearchUserQueryResult = Components.Schemas.SearchUserQueryResult;
export type Secret = Components.Schemas.Secret;
export type SecretURL = Components.Schemas.SecretURL;
export type ServiceAccountDTO = Components.Schemas.ServiceAccountDTO;
export type ServiceAccountProfileDTO = Components.Schemas.ServiceAccountProfileDTO;
export type setPermissionCommand = Components.Schemas.SetPermissionCommand;
export type setPermissionsCommand = Components.Schemas.SetPermissionsCommand;
export type SetResourcePermissionCommand = Components.Schemas.SetResourcePermissionCommand;
export type SetRoleAssignmentsCommand = Components.Schemas.SetRoleAssignmentsCommand;
export type SetTeamMembershipsCommand = Components.Schemas.SetTeamMembershipsCommand;
export type SetUserRolesCommand = Components.Schemas.SetUserRolesCommand;
export type SettingsBag = Components.Schemas.SettingsBag;
export type ShareType = Components.Schemas.ShareType;
export type SigV4Config = Components.Schemas.SigV4Config;
export type SignatureAlgorithm = Components.Schemas.SignatureAlgorithm;
export type silence = Components.Schemas.Silence;
export type SilenceMetadata = Components.Schemas.SilenceMetadata;
export type silenceStatus = Components.Schemas.SilenceStatus;
export type SlackAction = Components.Schemas.SlackAction;
export type SlackConfig = Components.Schemas.SlackConfig;
export type SlackConfirmationField = Components.Schemas.SlackConfirmationField;
export type SlackField = Components.Schemas.SlackField;
export type SmtpNotEnabled = Components.Schemas.SmtpNotEnabled;
export type SnapshotDTO = Components.Schemas.SnapshotDTO;
export type SnapshotListResponseDTO = Components.Schemas.SnapshotListResponseDTO;
export type SnapshotResourceStats = Components.Schemas.SnapshotResourceStats;
export type Source = Components.Schemas.Source;
export type Span = Components.Schemas.Span;
export type State = Components.Schemas.State;
export type Status = Components.Schemas.Status;
export type Success = Components.Schemas.Success;
export type SuccessResponseBody = Components.Schemas.SuccessResponseBody;
export type SupportedTransformationTypes = Components.Schemas.SupportedTransformationTypes;
export type SyncResult = Components.Schemas.SyncResult;
export type TLSConfig = Components.Schemas.TLSConfig;
export type TLSVersion = Components.Schemas.TLSVersion;
export type TagsDTO = Components.Schemas.TagsDTO;
export type TeamDTO = Components.Schemas.TeamDTO;
export type TeamGroupDTO = Components.Schemas.TeamGroupDTO;
export type TeamGroupMapping = Components.Schemas.TeamGroupMapping;
export type TeamLBACRule = Components.Schemas.TeamLBACRule;
export type TeamLBACRules = Components.Schemas.TeamLBACRules;
export type TeamMemberDTO = Components.Schemas.TeamMemberDTO;
export type TelegramConfig = Components.Schemas.TelegramConfig;
export type TempUserDTO = Components.Schemas.TempUserDTO;
export type TempUserStatus = Components.Schemas.TempUserStatus;
export type TestReceiverConfigResult = Components.Schemas.TestReceiverConfigResult;
export type TestReceiverResult = Components.Schemas.TestReceiverResult;
export type TestReceiversConfigAlertParams = Components.Schemas.TestReceiversConfigAlertParams;
export type TestReceiversConfigBodyParams = Components.Schemas.TestReceiversConfigBodyParams;
export type TestReceiversResult = Components.Schemas.TestReceiversResult;
export type TestRulePayload = Components.Schemas.TestRulePayload;
export type TestRuleResponse = Components.Schemas.TestRuleResponse;
export type TestTemplatesConfigBodyParams = Components.Schemas.TestTemplatesConfigBodyParams;
export type TestTemplatesErrorResult = Components.Schemas.TestTemplatesErrorResult;
export type TestTemplatesResult = Components.Schemas.TestTemplatesResult;
export type TestTemplatesResults = Components.Schemas.TestTemplatesResults;
export type Threshold = Components.Schemas.Threshold;
export type ThresholdsConfig = Components.Schemas.ThresholdsConfig;
export type ThresholdsMode = Components.Schemas.ThresholdsMode;
export type TimeInterval = Components.Schemas.TimeInterval;
export type TimeIntervalItem = Components.Schemas.TimeIntervalItem;
export type TimeIntervalTimeRange = Components.Schemas.TimeIntervalTimeRange;
export type TimeRange = Components.Schemas.TimeRange;
export type Token = Components.Schemas.Token;
export type TokenDTO = Components.Schemas.TokenDTO;
export type TokenStatus = Components.Schemas.TokenStatus;
export type Transformation = Components.Schemas.Transformation;
export type Transformations = Components.Schemas.Transformations;
export type Type = Components.Schemas.Type;
export type TypeMeta = Components.Schemas.TypeMeta;
export type URL = Components.Schemas.URL;
export type Unstructured = Components.Schemas.Unstructured;
export type UpdateAnnotationsCmd = Components.Schemas.UpdateAnnotationsCmd;
export type UpdateCorrelationCommand = Components.Schemas.UpdateCorrelationCommand;
export type UpdateCorrelationResponseBody = Components.Schemas.UpdateCorrelationResponseBody;
export type UpdateDashboardACLCommand = Components.Schemas.UpdateDashboardACLCommand;
export type UpdateDataSourceCommand = Components.Schemas.UpdateDataSourceCommand;
export type UpdateFolderCommand = Components.Schemas.UpdateFolderCommand;
export type UpdateOrgAddressForm = Components.Schemas.UpdateOrgAddressForm;
export type UpdateOrgForm = Components.Schemas.UpdateOrgForm;
export type UpdateOrgUserCommand = Components.Schemas.UpdateOrgUserCommand;
export type UpdatePlaylistCommand = Components.Schemas.UpdatePlaylistCommand;
export type UpdatePrefsCmd = Components.Schemas.UpdatePrefsCmd;
export type UpdateQuotaCmd = Components.Schemas.UpdateQuotaCmd;
export type UpdateRoleCommand = Components.Schemas.UpdateRoleCommand;
export type UpdateRuleGroupResponse = Components.Schemas.UpdateRuleGroupResponse;
export type UpdateServiceAccountForm = Components.Schemas.UpdateServiceAccountForm;
export type UpdateTeamCommand = Components.Schemas.UpdateTeamCommand;
export type UpdateTeamLBACCommand = Components.Schemas.UpdateTeamLBACCommand;
export type UpdateTeamMemberCommand = Components.Schemas.UpdateTeamMemberCommand;
export type UpdateUserCommand = Components.Schemas.UpdateUserCommand;
export type UserInfo = Components.Schemas.UserInfo;
export type UserLookupDTO = Components.Schemas.UserLookupDTO;
export type UserOrgDTO = Components.Schemas.UserOrgDTO;
export type UserProfileDTO = Components.Schemas.UserProfileDTO;
export type UserSearchHitDTO = Components.Schemas.UserSearchHitDTO;
export type UserToken = Components.Schemas.UserToken;
export type Userinfo = Components.Schemas.Userinfo;
export type ValidationError = Components.Schemas.ValidationError;
export type ValueMapping = Components.Schemas.ValueMapping;
export type ValueMappings = Components.Schemas.ValueMappings;
export type Vector = Components.Schemas.Vector;
export type versionInfo = Components.Schemas.VersionInfo;
export type VictorOpsConfig = Components.Schemas.VictorOpsConfig;
export type VisType = Components.Schemas.VisType;
export type WebexConfig = Components.Schemas.WebexConfig;
export type WebhookConfig = Components.Schemas.WebhookConfig;
export type WechatConfig = Components.Schemas.WechatConfig;
