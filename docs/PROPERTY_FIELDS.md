# Property Type Field Mapping Specifications

This document lists the required fields and mappings for various property types in the system, to be used as a reference by the frontend, backend, and mobile development teams.

## Property Type Classifications

```javascript
const isApartment = ['Apartments', 'Apartment', 'Builder Floor Apartment', 'Pent House', 'Studio Flat'].includes(type);
const isStandalone = ['Individual House', 'Individual House', 'Villas', 'Villa', 'Farm House'].includes(type);
const isLand = ['Residential Plots', 'Residential Plot', 'Agriculture Lands', 'Agriculture Land', 'Land for Development'].includes(type);
const isCommercial = ['Commercial Space'].includes(type);

const isResidential = isApartment || isStandalone;
const isProject = isApartment;
const isSingleUnit = isStandalone;
```

---

## Field Mappings by Category

### 1. Apartments & Societies (`isProject`)
- **`bhkConfig`**: BHK Configurations
- **`superBuiltUpArea`**: Super Built-up Area (SFT)
- **`builtUpArea`**: Built-up Area (SFT)
- **`numberOfFloors`**: Total Floors
- **`facing`**: Facing (Direction)
- **`vastuCompliant`**: Vastu Compliant (Yes / No)

### 2. Standalone Houses & Villas (`isSingleUnit`)
- **`bhkConfig`**: Number of Bedrooms
- **`builtUpArea`**: Built-up Area (SFT)
- **`numberOfFloors`**: Floor Number
- **`facing`**: Facing (Direction)
- **`plotArea`**: Plot Area
- **`plotAreaUnit`**: Plot Area Unit
- **`vastuCompliant`**: Vastu Compliant (Yes / No)

### 3. Plots & Agriculture Land (`isLand`)
- **`totalArea`**: Total Area
- **`totalAreaUnit`**: Total Area Unit
- **`dimensions.length`**: Dimension Length (Feet)
- **`dimensions.width`**: Dimension Width (Feet)
- **`roadWidth`**: Road Width (FT)
- **`facing`**: Facing (Direction)
- **`boundaryWall`**: Boundary Wall (Yes / No)

### 4. Commercial Spaces, Office Spaces & Shops (`isCommercial`)
- **`numberOfFloors`**: Total Number of Floors
- **`builtUpArea`**: Total Area (SFT)
- **`commercialType`**: Commercial Type
- **`facing`**: Facing (Direction)
- **`washrooms`**: Washrooms (Private / Shared / None)

---

## Developer & Mobile Team Notes

> [!IMPORTANT]
> - **Numeric Fields**: All Area fields (e.g., `builtUpArea`, `superBuiltUpArea`, `plotArea`, `totalArea`, `roadWidth`) should be parsed and treated as **Numbers** in payloads.
> - **Facing Dropdown**: The `facing` field is mandatory for all property classifications.
> - **Dimensions Layout**: The dimensions field is structured as a nested object:
>   ```json
>   {
>     "dimensions": {
>       "length": 0,
>       "width": 0
>     }
>   }
>   ```
