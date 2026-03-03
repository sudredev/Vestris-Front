# ContraindicacoesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarContraindicacao**](#atualizarcontraindicacao) | **PUT** /api/v1/contraindicacoes/{id} | Atualizar|
|[**buscarContraindicacaoPorId**](#buscarcontraindicacaoporid) | **GET** /api/v1/contraindicacoes/{id} | Buscar por ID|
|[**criarContraindicacao**](#criarcontraindicacao) | **POST** /api/v1/contraindicacoes | Cadastrar contraindicação|
|[**deletarContraindicacao**](#deletarcontraindicacao) | **DELETE** /api/v1/contraindicacoes/{id} | Remover|
|[**listarContraindicacoesPorMedicamento**](#listarcontraindicacoespormedicamento) | **GET** /api/v1/medicamentos/{medicamentoId}/contraindicacoes | Listar contraindicações de um medicamento|

# **atualizarContraindicacao**
> ApiResponseContraindicacao atualizarContraindicacao()


### Example

```typescript
import {
    ContraindicacoesApi,
    Configuration,
    ContraindicacaoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ContraindicacoesApi(configuration);

let id: string; // (default to undefined)
let contraindicacaoRequest: ContraindicacaoRequest; // (optional)

const { status, data } = await apiInstance.atualizarContraindicacao(
    id,
    contraindicacaoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **contraindicacaoRequest** | **ContraindicacaoRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseContraindicacao**

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

# **buscarContraindicacaoPorId**
> ApiResponseContraindicacao buscarContraindicacaoPorId()


### Example

```typescript
import {
    ContraindicacoesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContraindicacoesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarContraindicacaoPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseContraindicacao**

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

# **criarContraindicacao**
> ApiResponseContraindicacao criarContraindicacao()


### Example

```typescript
import {
    ContraindicacoesApi,
    Configuration,
    ContraindicacaoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ContraindicacoesApi(configuration);

let contraindicacaoRequest: ContraindicacaoRequest; // (optional)

const { status, data } = await apiInstance.criarContraindicacao(
    contraindicacaoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **contraindicacaoRequest** | **ContraindicacaoRequest**|  | |


### Return type

**ApiResponseContraindicacao**

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

# **deletarContraindicacao**
> deletarContraindicacao()


### Example

```typescript
import {
    ContraindicacoesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContraindicacoesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarContraindicacao(
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

# **listarContraindicacoesPorMedicamento**
> ApiResponseListaContraindicacao listarContraindicacoesPorMedicamento()


### Example

```typescript
import {
    ContraindicacoesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ContraindicacoesApi(configuration);

let medicamentoId: string; // (default to undefined)

const { status, data } = await apiInstance.listarContraindicacoesPorMedicamento(
    medicamentoId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **medicamentoId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseListaContraindicacao**

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

