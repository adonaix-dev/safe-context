import type { Dictionary, key } from "@adonaix/types";

function mapKeys<Key extends key, MapType>(
    keys: Key[],
    map: (key: Key) => MapType,
): Dictionary<Key, MapType> {
    return keys.reduce(
        (mapDictionary, key) => ((mapDictionary[key] = map(key)), mapDictionary),
        {} as Dictionary<Key, MapType>,
    );
}

export { mapKeys };
