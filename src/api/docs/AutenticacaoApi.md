# AutenticacaoApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**login**](#login) | **POST** /api/v1/auth/login | Fazer login e obter Token|
|[**registrarUsuario**](#registrarusuario) | **POST** /api/v1/auth/registro | Criar nova conta|

# **login**
> ApiResponseToken login()


### Example

```typescript
import {
    AutenticacaoApi,
    Configuration,
    LoginRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AutenticacaoApi(configuration);

let loginRequest: LoginRequest; // (optional)

const { status, data } = await apiInstance.login(
    loginRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **loginRequest** | **LoginRequest**|  | |


### Return type

**ApiResponseToken**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Login com sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registrarUsuario**
> ApiResponseUsuario registrarUsuario()


### Example

```typescript
import {
    AutenticacaoApi,
    Configuration,
    RegistroRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AutenticacaoApi(configuration);

let registroRequest: RegistroRequest; // (optional)

const { status, data } = await apiInstance.registrarUsuario(
    registroRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **registroRequest** | **RegistroRequest**|  | |


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
|**200** | Conta criada |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

