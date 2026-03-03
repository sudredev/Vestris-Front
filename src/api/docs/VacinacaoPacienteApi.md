# VacinacaoPacienteApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deletarVacinaAplicada**](#deletarvacinaaplicada) | **DELETE** /api/v1/vacinas-aplicadas/{id} | Remover registro de vacina (se erro)|
|[**listarVacinasDoPaciente**](#listarvacinasdopaciente) | **GET** /api/v1/pacientes/{pacienteId}/vacinas | Listar vacinas aplicadas no paciente|
|[**registrarVacinaPaciente**](#registrarvacinapaciente) | **POST** /api/v1/pacientes/{pacienteId}/vacinas | Registrar aplicação de vacina|

# **deletarVacinaAplicada**
> deletarVacinaAplicada()


### Example

```typescript
import {
    VacinacaoPacienteApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VacinacaoPacienteApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deletarVacinaAplicada(
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

# **listarVacinasDoPaciente**
> ApiResponseListaAplicacaoVacina listarVacinasDoPaciente()


### Example

```typescript
import {
    VacinacaoPacienteApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VacinacaoPacienteApi(configuration);

let pacienteId: string; // (default to undefined)

const { status, data } = await apiInstance.listarVacinasDoPaciente(
    pacienteId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pacienteId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseListaAplicacaoVacina**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Histórico vacinal |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registrarVacinaPaciente**
> ApiResponseAplicacaoVacina registrarVacinaPaciente()


### Example

```typescript
import {
    VacinacaoPacienteApi,
    Configuration,
    AplicacaoVacinaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new VacinacaoPacienteApi(configuration);

let pacienteId: string; // (default to undefined)
let veterinarioId: string; // (default to undefined)
let aplicacaoVacinaRequest: AplicacaoVacinaRequest; // (optional)

const { status, data } = await apiInstance.registrarVacinaPaciente(
    pacienteId,
    veterinarioId,
    aplicacaoVacinaRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **aplicacaoVacinaRequest** | **AplicacaoVacinaRequest**|  | |
| **pacienteId** | [**string**] |  | defaults to undefined|
| **veterinarioId** | [**string**] |  | defaults to undefined|


### Return type

**ApiResponseAplicacaoVacina**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Registrado com sucesso |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

