export class OrderedMap<K, V> extends Map<K, V> {
  private readonly _keys: Set<K>;

  public constructor(entries?: readonly (readonly [K, V])[] | null) {
    super(entries);
    this._keys = new Set();
    if (entries !== undefined && entries !== null) {
      this._keys = new Set(entries.map(([k, _]) => k));
    }
  }

  clear(this: OrderedMap<K, V>): void {
    super.clear();
    this._keys.clear();
  }

  delete(this: OrderedMap<K, V>, key: K): boolean {
    const result = super.delete(key);
    if (result === true) {
      this._keys.delete(key);
    }
    return result;
  }

  set<T extends OrderedMap<K, V>>(this: T, key: K, value: V): T {
    super.set(key, value);
    if (!this._keys.has(key)) {
      this._keys.add(key);
    }
    return this;
  }
}
