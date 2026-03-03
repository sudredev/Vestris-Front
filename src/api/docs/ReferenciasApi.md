# ReferenciasApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarReferencia**](#atualizarreferencia) | **PUT** /api/v1/referencias/{id} | Atualizar referência|
|[**buscarReferenciaPorId**](#buscarreferenciaporid) | **GET** /api/v1/referencias/{id} | Buscar por ID|
|[**criarReferencia**](#criarreferencia) | **POST** /api/v1/referencias | Cadastrar referência|
|[**deletarReferencia**](#deletarreferencia) | **DELETE** /api/v1/referencias/{id} | Remover referência|
|[**listarReferencias**](#listarreferencias) | **GET** /api/v1/referencias | Listar todas|

# **atualizarReferencia**
> ApiResponseReferencia atualizarReferencia()


### Example

```typescript
import {
    ReferenciasApi,
    Configuration,
    ReferenciaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ReferenciasApi(configuration);

let id: string; // (default to undefined)
let referenciaRequest: ReferenciaRequest; // (optional)

const { status, data } = await apiInstance.atualizarReferencia(
    id,
    referenciaRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **referenciaRequest** | **ReferenciaRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseReferencia**

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

# **buscarReferenciaPorId**
> ApiResponseReferencia buscarReferenciaPorId()


### Example

```typescript
import {
    ReferenciasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReferenciasApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarReferenciaPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseReferencia**

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

# **criarReferencia**
> ApiResponseReferencia criarReferencia()


### Example

```typescript
import {
    ReferenciasApi,
    Configuration,
    ReferenciaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ReferenciasApi(configuration);

let referenciaRequest: ReferenciaRequest; // (optional)

const { status, data } = await apiInstance.criarReferencia(
    referenciaRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **referenciaRequest** | **ReferenciaRequest**|  | |


### Return type

**ApiResponseReferencia**

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

# **deletarReferencia**
> deletarReferencia()

Bloqueia se estiver em uso (Protocolos, Vacinas, etc)

### Example

```typescript
import {
    ReferenciasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReferenciasApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarReferencia(
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

# **listarReferencias**
> ApiResponseListaReferencia listarReferencias()


### Example

```typescript
import {
    ReferenciasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReferenciasApi(configuration);

const { status, data } = await apiInstance.listarReferencias();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiResponseListaReferencia**

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

