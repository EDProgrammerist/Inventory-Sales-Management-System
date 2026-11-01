import rows from '../../backend/data/storefront-products.json'
import { decodeCatalog } from '../src/data/storefront-catalog'
export { selectCatalog } from '../src/data/storefront-catalog'

// Import/test data only. Production obtains its catalog from the public API.
export const storefrontProducts = decodeCatalog({products:rows})
