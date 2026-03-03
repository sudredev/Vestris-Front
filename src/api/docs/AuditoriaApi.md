# AuditoriaApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**listarLogsAuditoria**](#listarlogsauditoria) | **GET** /api/v1/auditoria | Listar logs de auditoria da clínica|
|[**registrarEventoAuditoria**](#registrareventoauditoria) | **POST** /api/v1/auditoria/evento | Registrar evento de frontend|

# **listarLogsAuditoria**
> ApiResponseListaAuditoria listarLogsAuditoria()


### Example

```typescript
import {
    AuditoriaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuditoriaApi(configuration);

let clinicaId: string; // (default to undefined)
let dataInicio: string; // (optional) (default to undefined)
let dataFim: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.listarLogsAuditoria(
    clinicaId,
    dataInicio,
    dataFim
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **clinicaId** | [**string**] |  | defaults to undefined|
| **dataInicio** | [**string**] |  | (optional) defaults to undefined|
| **dataFim** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ApiResponseListaAuditoria**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista de eventos |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registrarEventoAuditoria**
> ApiResponseSucesso registrarEventoAuditoria()


### Example

```typescript
import {
    AuditoriaApi,
    Configuration,
    EventoAuditoriaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AuditoriaApi(configuration);

let eventoAuditoriaRequest: EventoAuditoriaRequest; // (optional)

const { status, data } = await apiInstance.registrarEventoAuditoria(
    eventoAuditoriaRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventoAuditoriaRequest** | **EventoAuditoriaRequest**|  | |


### Return type

**ApiResponseSucesso**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Evento registrado |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

