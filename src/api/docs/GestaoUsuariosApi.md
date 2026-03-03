# GestaoUsuariosApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarUsuario**](#atualizarusuario) | **PUT** /api/v1/usuarios/{id} | Atualizar dados cadastrais|
|[**buscarUsuarioPorId**](#buscarusuarioporid) | **GET** /api/v1/usuarios/{id} | Buscar usuário por ID|
|[**deletarUsuario**](#deletarusuario) | **DELETE** /api/v1/usuarios/{id} | Remover usuário|
|[**listarUsuarios**](#listarusuarios) | **GET** /api/v1/usuarios | Listar usuários com filtros|

# **atualizarUsuario**
> ApiResponseUsuario atualizarUsuario()

Atualiza nome e CRMV. Não atualiza senha/email por aqui.

### Example

```typescript
import {
    GestaoUsuariosApi,
    Configuration,
    AtualizacaoUsuarioRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GestaoUsuariosApi(configuration);

let id: string; // (default to undefined)
let atualizacaoUsuarioRequest: AtualizacaoUsuarioRequest; // (optional)

const { status, data } = await apiInstance.atualizarUsuario(
    id,
    atualizacaoUsuarioRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **atualizacaoUsuarioRequest** | **AtualizacaoUsuarioRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseUsuario**

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

# **buscarUsuarioPorId**
> ApiResponseUsuario buscarUsuarioPorId()


### Example

```typescript
import {
    GestaoUsuariosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GestaoUsuariosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarUsuarioPorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseUsuario**

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

# **deletarUsuario**
> deletarUsuario()


### Example

```typescript
import {
    GestaoUsuariosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GestaoUsuariosApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarUsuario(
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

# **listarUsuarios**
> ApiResponseListaUsuario listarUsuarios()


### Example

```typescript
import {
    GestaoUsuariosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GestaoUsuariosApi(configuration);

let perfil: string; //Filtrar por perfil (optional) (default to undefined)
let apenasComCrmv: boolean; //Se true, traz apenas quem tem CRMV preenchido (optional) (default to undefined)

const { status, data } = await apiInstance.listarUsuarios(
    perfil,
    apenasComCrmv
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **perfil** | [**string**] | Filtrar por perfil | (optional) defaults to undefined|
| **apenasComCrmv** | [**boolean**] | Se true, traz apenas quem tem CRMV preenchido | (optional) defaults to undefined|


### Return type

**ApiResponseListaUsuario**

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

