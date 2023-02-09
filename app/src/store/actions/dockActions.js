export const addDockItem = (dock) => ({
    type    : "ADD_DOCK_ITEM",
    payload : { dock },
});

export const removeDockItem = (id) => ({
    type    : "REMOVE_DOCK_ITEM",
    payload : { id },
});
