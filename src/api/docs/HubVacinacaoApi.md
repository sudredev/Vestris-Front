# HubVacinacaoApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**listarVacinasAtrasadas**](#listarvacinasatrasadas) | **GET** /api/v1/hub-vacinacao/atrasadas | Listar vacinas atrasadas|
|[**listarVacinasPrevistas**](#listarvacinasprevistas) | **GET** /api/v1/hub-vacinacao/previstas | Listar próximas vacinas (30 dias)|

# **listarVacinasAtrasadas**
> ApiResponseListaAplicacaoVacina listarVacinasAtrasadas()


### Example

```typescript
import {
    HubVacinacaoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HubVacinacaoApi(configuration);

const { status, data } = await apiInstance.listarVacinasAtrasadas();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listarVacinasPrevistas**
> ApiResponseListaAplicacaoVacina listarVacinasPrevistas()


### Example

```typescript
import {
    HubVacinacaoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HubVacinacaoApi(configuration);

const { status, data } = await apiInstance.listarVacinasPrevistas();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

