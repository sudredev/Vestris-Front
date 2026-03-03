# WebhookControllerApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**receberNotificacao**](#recebernotificacao) | **POST** /api/v1/public/webhooks/mercadopago | |

# **receberNotificacao**
> receberNotificacao(webhookMP)


### Example

```typescript
import {
    WebhookControllerApi,
    Configuration,
    WebhookMP
} from './api';

const configuration = new Configuration();
const apiInstance = new WebhookControllerApi(configuration);

let webhookMP: WebhookMP; //

const { status, data } = await apiInstance.receberNotificacao(
    webhookMP
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **webhookMP** | **WebhookMP**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

