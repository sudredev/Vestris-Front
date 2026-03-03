# PlanosApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**buscarPlanoPorId**](#buscarplanoporid) | **GET** /api/v1/saas/planos/{id} | Buscar plano por ID|
|[**criarPlano**](#criarplano) | **POST** /api/v1/saas/planos | Criar novo plano (Super Admin)|
|[**listarPlanos**](#listarplanos) | **GET** /api/v1/saas/planos | Listar planos disponíveis|

# **buscarPlanoPorId**
> ApiResponsePlano buscarPlanoPorId()


### Example

```typescript
import {
    PlanosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlanosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarPlanoPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponsePlano**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **criarPlano**
> ApiResponsePlano criarPlano()


### Example

```typescript
import {
    PlanosApi,
    Configuration,
    PlanoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PlanosApi(configuration);

let planoRequest: PlanoRequest; // (optional)

const { status, data } = await apiInstance.criarPlano(
    planoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **planoRequest** | **PlanoRequest**|  | |


### Return type

**ApiResponsePlano**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Plano criado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarPlanos**
> ApiResponseListaPlano listarPlanos()


### Example

```typescript
import {
    PlanosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlanosApi(configuration);

const { status, data } = await apiInstance.listarPlanos();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiResponseListaPlano**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista de planos |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

