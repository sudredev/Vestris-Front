# MedicamentosApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarMedicamento**](#atualizarmedicamento) | **PUT** /api/v1/medicamentos/{id} | Atualizar|
|[**buscarMedicamentoPorId**](#buscarmedicamentoporid) | **GET** /api/v1/medicamentos/{id} | Buscar por ID|
|[**criarMedicamento**](#criarmedicamento) | **POST** /api/v1/medicamentos | Cadastrar medicamento|
|[**deletarMedicamento**](#deletarmedicamento) | **DELETE** /api/v1/medicamentos/{id} | Remover|
|[**listarMedicamentos**](#listarmedicamentos) | **GET** /api/v1/medicamentos | Listar medicamentos|
|[**listarViasDoMedicamento**](#listarviasdomedicamento) | **GET** /api/v1/medicamentos/{id}/vias | Listar vias de administração disponíveis|

# **atualizarMedicamento**
> ApiResponseMedicamento atualizarMedicamento()


### Example

```typescript
import {
    MedicamentosApi,
    Configuration,
    MedicamentoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MedicamentosApi(configuration);

let id: string; // (default to undefined)
let medicamentoRequest: MedicamentoRequest; // (optional)

const { status, data } = await apiInstance.atualizarMedicamento(
    id,
    medicamentoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **medicamentoRequest** | **MedicamentoRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseMedicamento**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Atualizado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **buscarMedicamentoPorId**
> ApiResponseMedicamento buscarMedicamentoPorId()


### Example

```typescript
import {
    MedicamentosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MedicamentosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarMedicamentoPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseMedicamento**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Encontrado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **criarMedicamento**
> ApiResponseMedicamento criarMedicamento()


### Example

```typescript
import {
    MedicamentosApi,
    Configuration,
    MedicamentoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MedicamentosApi(configuration);

let medicamentoRequest: MedicamentoRequest; // (optional)

const { status, data } = await apiInstance.criarMedicamento(
    medicamentoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **medicamentoRequest** | **MedicamentoRequest**|  | |


### Return type

**ApiResponseMedicamento**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deletarMedicamento**
> deletarMedicamento()


### Example

```typescript
import {
    MedicamentosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MedicamentosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarMedicamento(
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
|**204** | Removido |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarMedicamentos**
> ApiResponseListaMedicamento listarMedicamentos()


### Example

```typescript
import {
    MedicamentosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MedicamentosApi(configuration);

const { status, data } = await apiInstance.listarMedicamentos();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiResponseListaMedicamento**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarViasDoMedicamento**
> Array<string> listarViasDoMedicamento()

Retorna as vias cadastradas nas referências para este medicamento e espécie.

### Example

```typescript
import {
    MedicamentosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MedicamentosApi(configuration);

let id: string; // (default to undefined)
let especieId: string; // (default to undefined)

const { status, data } = await apiInstance.listarViasDoMedicamento(
    id,
    especieId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **especieId** | [**string**] |  | defaults to undefined|


### Return type

**Array<string>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista de vias (Strings) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

