# PrincipiosAtivosApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarPrincipioAtivo**](#atualizarprincipioativo) | **PUT** /api/v1/principios-ativos/{id} | Atualizar|
|[**buscarPrincipioAtivoPorId**](#buscarprincipioativoporid) | **GET** /api/v1/principios-ativos/{id} | Buscar por ID|
|[**criarPrincipioAtivo**](#criarprincipioativo) | **POST** /api/v1/principios-ativos | Cadastrar princípio ativo|
|[**deletarPrincipioAtivo**](#deletarprincipioativo) | **DELETE** /api/v1/principios-ativos/{id} | Remover|
|[**listarPrincipiosAtivos**](#listarprincipiosativos) | **GET** /api/v1/principios-ativos | Listar todos|

# **atualizarPrincipioAtivo**
> ApiResponsePrincipioAtivo atualizarPrincipioAtivo()


### Example

```typescript
import {
    PrincipiosAtivosApi,
    Configuration,
    PrincipioAtivoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PrincipiosAtivosApi(configuration);

let id: string; // (default to undefined)
let principioAtivoRequest: PrincipioAtivoRequest; // (optional)

const { status, data } = await apiInstance.atualizarPrincipioAtivo(
    id,
    principioAtivoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **principioAtivoRequest** | **PrincipioAtivoRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponsePrincipioAtivo**

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

# **buscarPrincipioAtivoPorId**
> ApiResponsePrincipioAtivo buscarPrincipioAtivoPorId()


### Example

```typescript
import {
    PrincipiosAtivosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PrincipiosAtivosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarPrincipioAtivoPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponsePrincipioAtivo**

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

# **criarPrincipioAtivo**
> ApiResponsePrincipioAtivo criarPrincipioAtivo()


### Example

```typescript
import {
    PrincipiosAtivosApi,
    Configuration,
    PrincipioAtivoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PrincipiosAtivosApi(configuration);

let principioAtivoRequest: PrincipioAtivoRequest; // (optional)

const { status, data } = await apiInstance.criarPrincipioAtivo(
    principioAtivoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **principioAtivoRequest** | **PrincipioAtivoRequest**|  | |


### Return type

**ApiResponsePrincipioAtivo**

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

# **deletarPrincipioAtivo**
> deletarPrincipioAtivo()

Não permite se houver medicamentos vinculados

### Example

```typescript
import {
    PrincipiosAtivosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PrincipiosAtivosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarPrincipioAtivo(
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

# **listarPrincipiosAtivos**
> ApiResponseListaPrincipioAtivo listarPrincipiosAtivos()


### Example

```typescript
import {
    PrincipiosAtivosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PrincipiosAtivosApi(configuration);

const { status, data } = await apiInstance.listarPrincipiosAtivos();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiResponseListaPrincipioAtivo**

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

