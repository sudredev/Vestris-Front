# ProtocolosVacinaisApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarProtocoloVacinal**](#atualizarprotocolovacinal) | **PUT** /api/v1/protocolos-vacinais/{id} | Atualizar protocolo|
|[**buscarProtocoloVacinalPorId**](#buscarprotocolovacinalporid) | **GET** /api/v1/protocolos-vacinais/{id} | Buscar protocolo por ID|
|[**criarProtocoloVacinal**](#criarprotocolovacinal) | **POST** /api/v1/protocolos-vacinais | Criar protocolo|
|[**deletarProtocoloVacinal**](#deletarprotocolovacinal) | **DELETE** /api/v1/protocolos-vacinais/{id} | Remover protocolo|
|[**listarProtocolosPorEspecie**](#listarprotocolosporespecie) | **GET** /api/v1/especies/{especieId}/protocolos-vacinais | Listar por espécie|

# **atualizarProtocoloVacinal**
> ApiResponseProtocoloVacinal atualizarProtocoloVacinal()


### Example

```typescript
import {
    ProtocolosVacinaisApi,
    Configuration,
    ProtocoloVacinalRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosVacinaisApi(configuration);

let id: string; // (default to undefined)
let protocoloVacinalRequest: ProtocoloVacinalRequest; // (optional)

const { status, data } = await apiInstance.atualizarProtocoloVacinal(
    id,
    protocoloVacinalRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **protocoloVacinalRequest** | **ProtocoloVacinalRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseProtocoloVacinal**

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

# **buscarProtocoloVacinalPorId**
> ApiResponseProtocoloVacinal buscarProtocoloVacinalPorId()


### Example

```typescript
import {
    ProtocolosVacinaisApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosVacinaisApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarProtocoloVacinalPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseProtocoloVacinal**

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

# **criarProtocoloVacinal**
> ApiResponseProtocoloVacinal criarProtocoloVacinal()


### Example

```typescript
import {
    ProtocolosVacinaisApi,
    Configuration,
    ProtocoloVacinalRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosVacinaisApi(configuration);

let protocoloVacinalRequest: ProtocoloVacinalRequest; // (optional)

const { status, data } = await apiInstance.criarProtocoloVacinal(
    protocoloVacinalRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **protocoloVacinalRequest** | **ProtocoloVacinalRequest**|  | |


### Return type

**ApiResponseProtocoloVacinal**

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

# **deletarProtocoloVacinal**
> deletarProtocoloVacinal()


### Example

```typescript
import {
    ProtocolosVacinaisApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosVacinaisApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarProtocoloVacinal(
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

# **listarProtocolosPorEspecie**
> ApiResponseListaProtocoloVacinal listarProtocolosPorEspecie()


### Example

```typescript
import {
    ProtocolosVacinaisApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProtocolosVacinaisApi(configuration);

let especieId: string; // (default to undefined)

const { status, data } = await apiInstance.listarProtocolosPorEspecie(
    especieId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **especieId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseListaProtocoloVacinal**

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

