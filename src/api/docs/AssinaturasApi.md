# AssinaturasApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**assinarPlano**](#assinarplano) | **POST** /api/v1/saas/assinar | Contratar ou mudar de plano|
|[**obterMinhaAssinatura**](#obterminhaassinatura) | **GET** /api/v1/saas/minha-assinatura | Obter status da assinatura da clínica logada|

# **assinarPlano**
> ApiResponseAssinatura assinarPlano()

Inicia o fluxo de checkout ou altera o plano imediatamente se for upgrade gratuito/trial

### Example

```typescript
import {
    AssinaturasApi,
    Configuration,
    AssinarPlanoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AssinaturasApi(configuration);

let clinicaId: string; // (default to undefined)
let assinarPlanoRequest: AssinarPlanoRequest; // (optional)

const { status, data } = await apiInstance.assinarPlano(
    clinicaId,
    assinarPlanoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **assinarPlanoRequest** | **AssinarPlanoRequest**|  | |
| **clinicaId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseAssinatura**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Sucesso (ou Link de Pagamento no futuro) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **obterMinhaAssinatura**
> ApiResponseAssinatura obterMinhaAssinatura()


### Example

```typescript
import {
    AssinaturasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AssinaturasApi(configuration);

let clinicaId: string; // (default to undefined)

const { status, data } = await apiInstance.obterMinhaAssinatura(
    clinicaId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **clinicaId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseAssinatura**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Detalhes da assinatura vigente |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

