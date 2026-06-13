import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useQueryParams(defaultQuery) {
    const [searchParams, setSearchParams] = useSearchParams();

    const [query, setQuery] = useState(() => {
        const obj = { ...defaultQuery };

        for (const key in defaultQuery) {
            const value = searchParams.get(key);
            if (value !== null) {
                obj[key] = value;
            }
        }

        return obj;
    });

    useEffect(() => {
        const params = {};

        Object.keys(query).forEach((key) => {
            if (query[key]) {
                params[key] = query[key];
            }
        });

        setSearchParams(params, { replace: true });
    }, [query]);

    return [query, setQuery];
}