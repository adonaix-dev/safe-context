import type { Dictionary, key } from "@adonaix/types";

function mapDictionary<Type extends Dictionary<key, any>, MapType>(
    dictionary: Type,
    map: (value: Type[keyof Type], key: keyof Type) => MapType,
): Dictionary<keyof Type, MapType> {
    return (Object.keys(dictionary) as (keyof Type)[]).reduce(
        (mapDictionary, key) => (
            (mapDictionary[key] = map(dictionary[key], key)),
            mapDictionary
        ),
        {} as Dictionary<keyof Type, MapType>,
    );
}

export { mapDictionary };
