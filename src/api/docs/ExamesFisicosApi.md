# ExamesFisicosApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarModeloExame**](#atualizarmodeloexame) | **PUT** /api/v1/especies/{especieId}/exame-fisico | Atualizar modelo de exame físico|
|[**criarModeloExame**](#criarmodeloexame) | **POST** /api/v1/especies/{especieId}/exame-fisico | Criar modelo de exame físico|
|[**deletarModeloExame**](#deletarmodeloexame) | **DELETE** /api/v1/especies/{especieId}/exame-fisico | Remover modelo de exame físico|
|[**listarTodosModelosExame**](#listartodosmodelosexame) | **GET** /api/v1/exames-fisicos | Listar todos os modelos cadastrados|
|[**obterModeloExame**](#obtermodeloexame) | **GET** /api/v1/especies/{especieId}/exame-fisico | Obter modelo de exame físico da espécie|

# **atualizarModeloExame**
> ApiResponseModeloExame atualizarModeloExame()


### Example

```typescript
import {
    ExamesFisicosApi,
    Configuration,
    ModeloExameRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ExamesFisicosApi(configuration);

let especieId: string; // (default to undefined)
let modeloExameRequest: ModeloExameRequest; // (optional)

const { status, data } = await apiInstance.atualizarModeloExame(
    especieId,
    modeloExameRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **modeloExameRequest** | **ModeloExameRequest**|  | |
| **especieId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseModeloExame**

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

# **criarModeloExame**
> ApiResponseModeloExame criarModeloExame()

Define o template padrão para uma espécie específica.

### Example

```typescript
import {
    ExamesFisicosApi,
    Configuration,
    ModeloExameRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ExamesFisicosApi(configuration);

let especieId: string; // (default to undefined)
let modeloExameRequest: ModeloExameRequest; // (optional)

const { status, data } = await apiInstance.criarModeloExame(
    especieId,
    modeloExameRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **modeloExameRequest** | **ModeloExameRequest**|  | |
| **especieId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseModeloExame**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Criado com sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deletarModeloExame**
> deletarModeloExame()


### Example

```typescript
import {
    ExamesFisicosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExamesFisicosApi(configuration);

let especieId: string; // (default to undefined)

const { status, data } = await apiInstance.deletarModeloExame(
    especieId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **especieId** | [**string**] |  | defaults to undefined|


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

# **listarTodosModelosExame**
> ApiResponseListaModeloExame listarTodosModelosExame()

Retorna todos os templates de exame físico de todas as espécies.

### Example

```typescript
import {
    ExamesFisicosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExamesFisicosApi(configuration);

const { status, data } = await apiInstance.listarTodosModelosExame();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiResponseListaModeloExame**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista recuperada com sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **obterModeloExame**
> ApiResponseModeloExame obterModeloExame()


### Example

```typescript
import {
    ExamesFisicosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExamesFisicosApi(configuration);

let especieId: string; // (default to undefined)

const { status, data } = await apiInstance.obterModeloExame(
    especieId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **especieId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseModeloExame**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Modelo encontrado |  -  |
|**404** | Modelo não definido para esta espécie |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

