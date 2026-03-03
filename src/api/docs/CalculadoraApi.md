# CalculadoraApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**calcularDosagemSegura**](#calculardosagemsegura) | **POST** /api/v1/calculadora/dosagem | Calcular via Protocolo|
|[**calcularDoseLivre**](#calculardoselivre) | **POST** /api/v1/calculadora/livre | Calculadora Livre (Sem Validação)|
|[**validarDoseCatalogo**](#validardosecatalogo) | **POST** /api/v1/calculadora/validar | Validar Dose (Catálogo)|

# **calcularDosagemSegura**
> ApiResponseCalculo calcularDosagemSegura()


### Example

```typescript
import {
    CalculadoraApi,
    Configuration,
    CalculoSeguroRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CalculadoraApi(configuration);

let calculoSeguroRequest: CalculoSeguroRequest; // (optional)

const { status, data } = await apiInstance.calcularDosagemSegura(
    calculoSeguroRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calculoSeguroRequest** | **CalculoSeguroRequest**|  | |


### Return type

**ApiResponseCalculo**

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

# **calcularDoseLivre**
> ApiResponseCalculo calcularDoseLivre()

Faz apenas o cálculo matemático de volume com base na dose e concentração informadas.

### Example

```typescript
import {
    CalculadoraApi,
    Configuration,
    CalculoLivreRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CalculadoraApi(configuration);

let calculoLivreRequest: CalculoLivreRequest; // (optional)

const { status, data } = await apiInstance.calcularDoseLivre(
    calculoLivreRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calculoLivreRequest** | **CalculoLivreRequest**|  | |


### Return type

**ApiResponseCalculo**

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

# **validarDoseCatalogo**
> ApiResponseCalculo validarDoseCatalogo()

Verifica se a dose está segura cruzando com a base científica.

### Example

```typescript
import {
    CalculadoraApi,
    Configuration,
    CalculoCatalogoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CalculadoraApi(configuration);

let calculoCatalogoRequest: CalculoCatalogoRequest; // (optional)

const { status, data } = await apiInstance.validarDoseCatalogo(
    calculoCatalogoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calculoCatalogoRequest** | **CalculoCatalogoRequest**|  | |


### Return type

**ApiResponseCalculo**

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

