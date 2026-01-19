import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  type EditPinnedSiteData,
  EditPinnedSiteDialog,
} from "@/components/dialogs/edit-pinned-site-dialog";
import {
  addPinnedSite,
  getFaviconUrl,
  loadPinnedSites,
  type PinnedSite,
  removePinnedSite,
  savePinnedSites,
  updatePinnedSite,
} from "@/lib/pinned-sites";
import {
  Pencil,
  Plus,
  Settings,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useContextMenu } from "@/contexts/context-menu-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

const MAX_PINNED_SITES = 16;

export function PinnedSitesBar() {
  const { showContextMenu } = useContextMenu();
  const [sites, setSites] = React.useState<PinnedSite[]>(() =>
    loadPinnedSites()
  );
  const [editingSite, setEditingSite] = React.useState<PinnedSite | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);

  // Persist sites on change
  React.useEffect(() => {
    savePinnedSites(sites);
  }, [sites]);

  // Listen for event to open pin site dialog from context menu
  React.useEffect(() => {
    const handleOpenPinSiteDialog = () => setIsAdding(true);
    window.addEventListener(
      "kiwi-open-pin-site-dialog",
      handleOpenPinSiteDialog,
    );
    return () =>
      window.removeEventListener(
        "kiwi-open-pin-site-dialog",
        handleOpenPinSiteDialog,
      );
  }, []);

  const handleEdit = (site: PinnedSite) => {
    setEditingSite(site);
  };

  const handleRemove = (id: string) => {
    setSites((prev) => removePinnedSite(prev, id));
  };

  const handleSaveEdit = (data: EditPinnedSiteData) => {
    if (editingSite) {
      setSites((prev) =>
        updatePinnedSite(prev, editingSite.id, {
          title: data.title,
          url: data.url,
          backgroundColor: data.backgroundColor,
        })
      );
      setEditingSite(null);
    }
  };

  const handleAddSite = (data: EditPinnedSiteData) => {
    setSites((prev) =>
      addPinnedSite(prev, data.url, data.title, data.backgroundColor)
    );
    setIsAdding(false);
  };

  const handleSiteClick = (url: string) => {
    window.open(url, "_self");
  };

  // Check if we can add more sites (for showing context menu)
  const canAddSite = sites.length < MAX_PINNED_SITES;

  return (
    <>
      {/* macOS-style dock at bottom */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
        <ContextMenu>
          <ContextMenuTrigger disabled={!canAddSite} asChild>
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-2xl shadow-2xl gradient-border origin-bottom transition-transform duration-100 ease-out"
              onContextMenu={() => {
                // Close other context menus when this one opens
                window.dispatchEvent(
                  new CustomEvent("kiwi-close-all-context-menus"),
                );
              }}
            >
              {/* Existing sites */}
              {sites.map((site) => (
                <Tooltip key={site.id}>
                  <TooltipTrigger asChild>
                    <button
                      className="size-10 rounded-xl hover:brightness-110 flex items-center justify-center overflow-hidden transition-all duration-200 cursor-pointer shadow-sm hover:scale-110 hover:-translate-y-1 relative"
                      style={{
                        backgroundColor: site.backgroundColor ||
                          "rgba(255,255,255,1)",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSiteClick(site.url);
                      }}
                      onContextMenu={(e) => {
                        showContextMenu(e, [
                          {
                            id: "edit",
                            label: "Edit Site",
                            icon: <Pencil className="size-4 mr-2" />,
                            onClick: () => handleEdit(site),
                            separator: true,
                          },
                          {
                            id: "remove",
                            label: "Remove Site",
                            icon: <Trash2 className="size-4 mr-2" />,
                            variant: "destructive",
                            onClick: () => handleRemove(site.id),
                          },
                        ]);
                      }}
                    >
                      <img
                        src={getFaviconUrl(site.url, 64)}
                        alt={site.title}
                        className="size-7 object-contain"
                        loading="lazy"
                      />
                      {/* iOS-style gradient overlay + inner border */}
                      <div
                        className="absolute inset-0 pointer-events-none rounded-xl z-10"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%, rgba(0,0,0,0.15) 100%)",
                          boxShadow:
                            "inset 1px 1px 0 0 rgba(255,255,255,0.1), inset -1px -1px 0 0 rgba(0,0,0,0.05)",
                        }}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8}>
                    {site.title}
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Divider before action buttons */}
              <div className="w-px h-8 bg-white/20 mx-1" />

              {/* Customize button - opens widget picker */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 hover:-translate-y-1"
                    onClick={() =>
                      window.dispatchEvent(
                        new Event("kiwi-open-widget-picker"),
                      )}
                  >
                    <SlidersHorizontal className="size-5 text-foreground/70" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  Customize
                </TooltipContent>
              </Tooltip>

              {/* Settings button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 hover:-translate-y-1"
                    onClick={() =>
                      window.dispatchEvent(new Event("kiwi-open-settings"))}
                  >
                    <Settings className="size-5 text-foreground/70" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  Settings
                </TooltipContent>
              </Tooltip>
            </div>
          </ContextMenuTrigger>

          {/* Dock context menu (right-click on empty space) */}
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => {
                setIsAdding(true);
              }}
            >
              <Plus className="size-4" />
              Add New Site
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {/* Edit Dialog */}
      <EditPinnedSiteDialog
        open={editingSite !== null}
        onOpenChange={(open) => !open && setEditingSite(null)}
        initialData={editingSite
          ? {
            title: editingSite.title,
            url: editingSite.url,
            backgroundColor: editingSite.backgroundColor,
          }
          : undefined}
        onSave={handleSaveEdit}
        mode="edit"
      />

      {/* Add Dialog */}
      <EditPinnedSiteDialog
        open={isAdding}
        onOpenChange={setIsAdding}
        onSave={handleAddSite}
        mode="add"
      />
    </>
  );
}
