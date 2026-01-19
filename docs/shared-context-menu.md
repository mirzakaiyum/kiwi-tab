# Shared Context Menu System

## Overview

The shared context menu system eliminates z-index conflicts and backdrop-blur
glitches by using a **single global context menu instance** that can be
triggered from anywhere in the application with different menu items.

## Benefits

✅ **No Z-Index Conflicts** - Single menu = single z-index layer\
✅ **No Backdrop-Blur Glitches** - Only one backdrop-blur element exists\
✅ **Better Performance** - Fewer DOM elements and compositing layers\
✅ **Consistent UX** - Same animation and styling everywhere\
✅ **Easier Maintenance** - Centralized menu logic

## Architecture

### Provider

`ContextMenuProvider` wraps the entire app and manages the global menu state.

### Hook

`useContextMenu()` provides access to `showContextMenu()` and
`hideContextMenu()` functions.

### Menu Items

Menu items are configured as objects with:

- `id`: Unique identifier
- `label`: Display text
- `icon`: Optional React node (icon component)
- `variant`: Optional "default" | "destructive"
- `onClick`: Handler function
- `separator`: Optional boolean to add separator after item

## Usage Examples

### Basic Usage

```tsx
import { useContextMenu } from "@/contexts/context-menu-context";
import { Pencil, Trash2 } from "lucide-react";

function MyComponent() {
  const { showContextMenu } = useContextMenu();

  const handleContextMenu = (e: React.MouseEvent) => {
    showContextMenu(e, [
      {
        id: "edit",
        label: "Edit",
        icon: <Pencil className="size-4 mr-2" />,
        onClick: () => console.log("Edit clicked"),
        separator: true, // Add separator after this item
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Trash2 className="size-4 mr-2" />,
        variant: "destructive",
        onClick: () => console.log("Delete clicked"),
      },
    ]);
  };

  return (
    <div onContextMenu={handleContextMenu}>
      Right-click me!
    </div>
  );
}
```

### Dynamic Menu Items

```tsx
const { showContextMenu } = useContextMenu();
const [isLocked, setIsLocked] = useState(false);

const handleContextMenu = (e: React.MouseEvent) => {
  showContextMenu(e, [
    {
      id: "lock",
      label: isLocked ? "Unlock" : "Lock",
      icon: isLocked
        ? <Lock className="size-4" />
        : <Unlock className="size-4" />,
      onClick: () => setIsLocked(!isLocked),
    },
  ]);
};
```

### With Item-Specific Data

```tsx
const handleItemContextMenu = (e: React.MouseEvent, item: Item) => {
  showContextMenu(e, [
    {
      id: "edit",
      label: "Edit",
      icon: <Pencil className="size-4 mr-2" />,
      onClick: () => handleEdit(item),
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="size-4 mr-2" />,
      variant: "destructive",
      onClick: () => handleDelete(item.id),
    },
  ]);
};
```

## Implementation Details

### Auto-Close Behavior

The menu automatically closes when:

- User clicks anywhere
- User right-clicks (opens new menu)
- User presses Escape key

### Z-Index

The shared menu uses `z-50` and is rendered at the root level via the provider,
ensuring it's always on top and doesn't conflict with other elements.

### Positioning

The menu is positioned at the cursor location using `clientX` and `clientY` from
the mouse event.

## Migrating Existing Context Menus

### Before (Individual Context Menu)

```tsx
<ContextMenu>
  <ContextMenuTrigger>
    <button>Right-click me</button>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onClick={handleEdit}>
      <Pencil className="size-4 mr-2" />
      Edit
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>;
```

### After (Shared Context Menu)

```tsx
const { showContextMenu } = useContextMenu();

<button
  onContextMenu={(e) => {
    showContextMenu(e, [
      {
        id: "edit",
        label: "Edit",
        icon: <Pencil className="size-4 mr-2" />,
        onClick: handleEdit,
      },
    ]);
  }}
>
  Right-click me
</button>;
```

## Components Already Using Shared Menu

- ✅ **PinnedSitesBar** - Dock icon context menus
- ✅ **DesktopContextMenu** - Desktop background menu

## Next Steps

Consider migrating these components:

- Widget context menus
- Any other components using individual ContextMenu instances
