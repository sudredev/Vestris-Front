# AdminGlobalApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**impersonateUser**](#impersonateuser) | **POST** /api/v1/admin/impersonate | Gerar token de acesso para qualquer usuário|

# **impersonateUser**
> ApiResponseToken impersonateUser()


### Example

```typescript
import {
    AdminGlobalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGlobalApi(configuration);

let adminId: string; // (default to undefined)
let targetUserId: string; // (default to undefined)

const { status, data } = await apiInstance.impersonateUser(
    adminId,
    targetUserId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **adminId** | [**string**] |  | defaults to undefined|
| **targetUserId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseToken**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Token gerado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

