# VacinasApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarVacina**](#atualizarvacina) | **PUT** /api/v1/vacinas/{id} | Atualizar vacina|
|[**buscarVacinaPorId**](#buscarvacinaporid) | **GET** /api/v1/vacinas/{id} | Buscar por ID|
|[**criarVacina**](#criarvacina) | **POST** /api/v1/vacinas | Cadastrar vacina|
|[**deletarVacina**](#deletarvacina) | **DELETE** /api/v1/vacinas/{id} | Remover vacina|
|[**listarVacinas**](#listarvacinas) | **GET** /api/v1/vacinas | Listar todas|

# **atualizarVacina**
> ApiResponseVacina atualizarVacina()


### Example

```typescript
import {
    VacinasApi,
    Configuration,
    VacinaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new VacinasApi(configuration);

let id: string; // (default to undefined)
let vacinaRequest: VacinaRequest; // (optional)

const { status, data } = await apiInstance.atualizarVacina(
    id,
    vacinaRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vacinaRequest** | **VacinaRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseVacina**

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

# **buscarVacinaPorId**
> ApiResponseVacina buscarVacinaPorId()


### Example

```typescript
import {
    VacinasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VacinasApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarVacinaPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseVacina**

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

# **criarVacina**
> ApiResponseVacina criarVacina()


### Example

```typescript
import {
    VacinasApi,
    Configuration,
    VacinaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new VacinasApi(configuration);

let vacinaRequest: VacinaRequest; // (optional)

const { status, data } = await apiInstance.criarVacina(
    vacinaRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **vacinaRequest** | **VacinaRequest**|  | |


### Return type

**ApiResponseVacina**

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

# **deletarVacina**
> deletarVacina()

Não permite remover se estiver em uso num protocolo

### Example

```typescript
import {
    VacinasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VacinasApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarVacina(
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

# **listarVacinas**
> ApiResponseListaVacina listarVacinas()


### Example

```typescript
import {
    VacinasApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VacinasApi(configuration);

const { status, data } = await apiInstance.listarVacinas();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiResponseListaVacina**

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

