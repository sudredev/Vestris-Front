# EspeciesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarEspecie**](#atualizarespecie) | **PUT** /api/v1/especies/{id} | Atualizar dados da espécie|
|[**buscarEspeciePorId**](#buscarespecieporid) | **GET** /api/v1/especies/{id} | Buscar espécie por ID|
|[**criarEspecie**](#criarespecie) | **POST** /api/v1/especies | Cadastrar nova espécie|
|[**deletarEspecie**](#deletarespecie) | **DELETE** /api/v1/especies/{id} | Remover espécie|
|[**listarEspecies**](#listarespecies) | **GET** /api/v1/especies | Listar todas as espécies|

# **atualizarEspecie**
> ApiResponseEspecie atualizarEspecie()


### Example

```typescript
import {
    EspeciesApi,
    Configuration,
    EspecieRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new EspeciesApi(configuration);

let id: string; // (default to undefined)
let especieRequest: EspecieRequest; // (optional)

const { status, data } = await apiInstance.atualizarEspecie(
    id,
    especieRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **especieRequest** | **EspecieRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseEspecie**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Atualizado com sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **buscarEspeciePorId**
> ApiResponseEspecie buscarEspeciePorId()


### Example

```typescript
import {
    EspeciesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EspeciesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarEspeciePorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseEspecie**

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

# **criarEspecie**
> ApiResponseEspecie criarEspecie()


### Example

```typescript
import {
    EspeciesApi,
    Configuration,
    EspecieRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new EspeciesApi(configuration);

let especieRequest: EspecieRequest; // (optional)

const { status, data } = await apiInstance.criarEspecie(
    especieRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **especieRequest** | **EspecieRequest**|  | |


### Return type

**ApiResponseEspecie**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Espécie criada com sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deletarEspecie**
> deletarEspecie()


### Example

```typescript
import {
    EspeciesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EspeciesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarEspecie(
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

# **listarEspecies**
> ApiResponseListaEspecie listarEspecies()


### Example

```typescript
import {
    EspeciesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EspeciesApi(configuration);

const { status, data } = await apiInstance.listarEspecies();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiResponseListaEspecie**

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

