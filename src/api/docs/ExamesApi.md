# ExamesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deletarExame**](#deletarexame) | **DELETE** /api/v1/exames/{id} | Remover anexo|
|[**listarExamesPorAtendimento**](#listarexamesporatendimento) | **GET** /api/v1/atendimentos/{atendimentoId}/exames | Listar exames de um atendimento|
|[**uploadExame**](#uploadexame) | **POST** /api/v1/atendimentos/{atendimentoId}/exames | Anexar novo exame/arquivo|

# **deletarExame**
> deletarExame()


### Example

```typescript
import {
    ExamesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExamesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarExame(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Removido com sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarExamesPorAtendimento**
> ApiResponseListaExameAnexo listarExamesPorAtendimento()


### Example

```typescript
import {
    ExamesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExamesApi(configuration);

let atendimentoId: string; // (default to undefined)

const { status, data } = await apiInstance.listarExamesPorAtendimento(
    atendimentoId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **atendimentoId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseListaExameAnexo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista recuperada |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadExame**
> ApiResponseExameAnexo uploadExame()


### Example

```typescript
import {
    ExamesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExamesApi(configuration);

let atendimentoId: string; // (default to undefined)
let arquivo: File; //Arquivo PDF, JPG ou PNG (default to undefined)
let observacoes: string; //Notas sobre o exame (opcional) (optional) (default to undefined)

const { status, data } = await apiInstance.uploadExame(
    atendimentoId,
    arquivo,
    observacoes
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **atendimentoId** | [**string**] |  | defaults to undefined|
| **arquivo** | [**File**] | Arquivo PDF, JPG ou PNG | defaults to undefined|
| **observacoes** | [**string**] | Notas sobre o exame (opcional) | (optional) defaults to undefined|


### Return type

**ApiResponseExameAnexo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Upload realizado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

