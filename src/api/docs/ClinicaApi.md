# ClinicaApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**adicionarMembroEquipe**](#adicionarmembroequipe) | **POST** /api/v1/minha-clinica/equipe | Adicionar veterinário à equipe|
|[**listarEquipe**](#listarequipe) | **GET** /api/v1/minha-clinica/equipe | Listar veterinários da minha clínica|
|[**obterMinhaClinica**](#obterminhaclinica) | **GET** /api/v1/minha-clinica | Obter dados da minha clínica|
|[**removerMembroEquipe**](#removermembroequipe) | **DELETE** /api/v1/minha-clinica/equipe | Remover veterinário da equipe|
|[**salvarMinhaClinica**](#salvarminhaclinica) | **POST** /api/v1/minha-clinica | Criar ou Atualizar minha clínica|

# **adicionarMembroEquipe**
> ApiResponseUsuario adicionarMembroEquipe()


### Example

```typescript
import {
    ClinicaApi,
    Configuration,
    NovoMembroRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ClinicaApi(configuration);

let usuarioId: string; // (default to undefined)
let novoMembroRequest: NovoMembroRequest; // (optional)

const { status, data } = await apiInstance.adicionarMembroEquipe(
    usuarioId,
    novoMembroRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **novoMembroRequest** | **NovoMembroRequest**|  | |
| **usuarioId** | [**string**] |  | defaults to undefined|


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
|**201** | Membro criado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarEquipe**
> ApiResponseListaUsuario listarEquipe()


### Example

```typescript
import {
    ClinicaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ClinicaApi(configuration);

let usuarioId: string; // (default to undefined)

const { status, data } = await apiInstance.listarEquipe(
    usuarioId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **usuarioId** | [**string**] |  | defaults to undefined|


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
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **obterMinhaClinica**
> ApiResponseClinica obterMinhaClinica()


### Example

```typescript
import {
    ClinicaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ClinicaApi(configuration);

let usuarioId: string; // (default to undefined)

const { status, data } = await apiInstance.obterMinhaClinica(
    usuarioId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **usuarioId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseClinica**

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

# **removerMembroEquipe**
> removerMembroEquipe()

Desvincula o veterinário da clínica. Ele perde acesso aos dados, mas o histórico é mantido.

### Example

```typescript
import {
    ClinicaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ClinicaApi(configuration);

let usuarioId: string; //ID do Admin que está removendo (default to undefined)
let membroId: string; //ID do Veterinário a ser removido (default to undefined)

const { status, data } = await apiInstance.removerMembroEquipe(
    usuarioId,
    membroId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **usuarioId** | [**string**] | ID do Admin que está removendo | defaults to undefined|
| **membroId** | [**string**] | ID do Veterinário a ser removido | defaults to undefined|


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

# **salvarMinhaClinica**
> ApiResponseClinica salvarMinhaClinica()


### Example

```typescript
import {
    ClinicaApi,
    Configuration,
    ClinicaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ClinicaApi(configuration);

let usuarioId: string; // (default to undefined)
let clinicaRequest: ClinicaRequest; // (optional)

const { status, data } = await apiInstance.salvarMinhaClinica(
    usuarioId,
    clinicaRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **clinicaRequest** | **ClinicaRequest**|  | |
| **usuarioId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseClinica**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

