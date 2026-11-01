import { DeviceMobileIcon, GraphicsCardIcon, GameControllerIcon } from '@phosphor-icons/react'

export const shopCategories = [
  { id: 'phones' as const, name: 'Phones', detail: 'iPhone', icon: DeviceMobileIcon },
  { id: 'computers' as const, name: 'Computers', detail: 'Graphics cards', icon: GraphicsCardIcon },
  { id: 'consoles' as const, name: 'Consoles', detail: 'PlayStation 5', icon: GameControllerIcon },
]
