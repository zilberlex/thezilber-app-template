export type PersistedItem<IType = string> = {
	itemType: IType;
};

export interface PersistableItem<PType extends PersistedItem<IType>, IType = string> {
	persist: () => PType;
}
