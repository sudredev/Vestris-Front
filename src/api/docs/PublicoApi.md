# PublicoApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cadastrarClienteSaas**](#cadastrarclientesaas) | **POST** /api/v1/public/cadastro-saas | Criar conta com plano e clínica|

# **cadastrarClienteSaas**
> ApiResponseToken cadastrarClienteSaas()


### Example

```typescript
import {
    PublicoApi,
    Configuration,
    CadastroSaasRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicoApi(configuration);

let cadastroSaasRequest: CadastroSaasRequest; // (optional)

const { status, data } = await apiInstance.cadastrarClienteSaas(
    cadastroSaasRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cadastroSaasRequest** | **CadastroSaasRequest**|  | |


### Return type

**ApiResponseToken**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Conta criada e logada |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

