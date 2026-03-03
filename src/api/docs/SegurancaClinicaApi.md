# SegurancaClinicaApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**validarSeguranca**](#validarseguranca) | **GET** /api/v1/seguranca/validar | Validar medicamento para espécie|

# **validarSeguranca**
> Array<AlertaSeguranca> validarSeguranca()


### Example

```typescript
import {
    SegurancaClinicaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SegurancaClinicaApi(configuration);

let medicamentoId: string; // (default to undefined)
let especieId: string; // (default to undefined)

const { status, data } = await apiInstance.validarSeguranca(
    medicamentoId,
    especieId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **medicamentoId** | [**string**] |  | defaults to undefined|
| **especieId** | [**string**] |  | defaults to undefined|


### Return type

**Array<AlertaSeguranca>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Lista de alertas (vazio se seguro) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

