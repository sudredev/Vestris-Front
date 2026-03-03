# DoencasApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarDoenca**](#atualizardoenca) | **PUT** /api/v1/doencas/{id} | Atualizar doença|
|[**buscarDoencaPorId**](#buscardoencaporid) | **GET** /api/v1/doencas/{id} | Buscar doença por ID|
|[**criarDoenca**](#criardoenca) | **POST** /api/v1/doencas | Cadastrar nova doença|
|[**deletarDoenca**](#deletardoenca) | **DELETE** /api/v1/doencas/{id} | Remover doença|
|[**listarDoencas**](#listardoencas) | **GET** /api/v1/doencas | Listar todas as doenças|
|[**listarDoencasPorEspecie**](#listardoencasporespecie) | **GET** /api/v1/doencas/por-especie/{especieId} | Listar doenças de uma espécie específica|

# **atualizarDoenca**
> ApiResponseDoenca atualizarDoenca()


### Example

```typescript
import {
    DoencasApi,
    Configuration,
    DoencaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DoencasApi(configuration);

let id: string; // (default to undefined)
let doencaRequest: DoencaRequest; // (optional)

const { status, data } = await apiInstance.atualizarDoenca(
    id,
    doencaRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **doencaRequest** | **DoencaRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseDoenca**

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

# **buscarDoencaPorId**
> ApiResponseDoenca buscarDoencaPorId()


### Example

```typescript
import {
    DoencasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DoencasApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarDoencaPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseDoenca**

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

# **criarDoenca**
> ApiResponseDoenca criarDoenca()


### Example

```typescript
import {
    DoencasApi,
    Configuration,
    DoencaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DoencasApi(configuration);

let doencaRequest: DoencaRequest; // (optional)

const { status, data } = await apiInstance.criarDoenca(
    doencaRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **doencaRequest** | **DoencaRequest**|  | |


### Return type

**ApiResponseDoenca**

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

# **deletarDoenca**
> deletarDoenca()


### Example

```typescript
import {
    DoencasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DoencasApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarDoenca(
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

# **listarDoencas**
> ApiResponseListaDoenca listarDoencas()


### Example

```typescript
import {
    DoencasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DoencasApi(configuration);

const { status, data } = await apiInstance.listarDoencas();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiResponseListaDoenca**

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

# **listarDoencasPorEspecie**
> ApiResponseListaDoenca listarDoencasPorEspecie()


### Example

```typescript
import {
    DoencasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DoencasApi(configuration);

let especieId: string; // (default to undefined)

const { status, data } = await apiInstance.listarDoencasPorEspecie(
    especieId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **especieId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseListaDoenca**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista filtrada |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

