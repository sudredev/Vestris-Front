# PacientesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**atualizarPaciente**](#atualizarpaciente) | **PUT** /api/v1/pacientes/{id} | Atualizar dados do paciente|
|[**buscarPacientePorId**](#buscarpacienteporid) | **GET** /api/v1/pacientes/{id} | Buscar paciente por ID|
|[**criarPaciente**](#criarpaciente) | **POST** /api/v1/pacientes | Cadastrar novo paciente|
|[**deletarPaciente**](#deletarpaciente) | **DELETE** /api/v1/pacientes/{id} | Remover paciente|
|[**listarPacientes**](#listarpacientes) | **GET** /api/v1/pacientes | Listar meus pacientes|

# **atualizarPaciente**
> ApiResponsePaciente atualizarPaciente()


### Example

```typescript
import {
    PacientesApi,
    Configuration,
    PacienteRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PacientesApi(configuration);

let id: string; // (default to undefined)
let pacienteRequest: PacienteRequest; // (optional)

const { status, data } = await apiInstance.atualizarPaciente(
    id,
    pacienteRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pacienteRequest** | **PacienteRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponsePaciente**

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

# **buscarPacientePorId**
> ApiResponsePaciente buscarPacientePorId()


### Example

```typescript
import {
    PacientesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PacientesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buscarPacientePorId(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponsePaciente**

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

# **criarPaciente**
> ApiResponsePaciente criarPaciente()


### Example

```typescript
import {
    PacientesApi,
    Configuration,
    PacienteRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PacientesApi(configuration);

let pacienteRequest: PacienteRequest; // (optional)

const { status, data } = await apiInstance.criarPaciente(
    pacienteRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pacienteRequest** | **PacienteRequest**|  | |


### Return type

**ApiResponsePaciente**

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

# **deletarPaciente**
> deletarPaciente()

Remove o paciente apenas se não houver atendimentos vinculados

### Example

```typescript
import {
    PacientesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PacientesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarPaciente(
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
|**204** | Removido com sucesso (No Content) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarPacientes**
> ApiResponseListaPaciente listarPacientes()

Filtra pelo veterinário logado (ou ID passado)

### Example

```typescript
import {
    PacientesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PacientesApi(configuration);

let veterinarioId: string; // (default to undefined)

const { status, data } = await apiInstance.listarPacientes(
    veterinarioId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **veterinarioId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseListaPaciente**

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

