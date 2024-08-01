import axios from "axios";
import { useEffect, useState } from "react";
import { getUsername, getUser } from '../helper/helper';

export default function useFetch(query){
    const [getData, setData] = useState({ isLoading: false, apiData: undefined, status: null, serverError: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setData(prev => ({ ...prev, isLoading: true }));

                const username = query ? '' : (await getUsername()).username;
                const response = query ? await axios.get(`/api/${query}`) : await getUser({ username });

                console.log(response.data); // Ensure correct data structure

                if (response.status === 200) {
                    setData(prev => ({ ...prev, apiData: response.data, status: response.status }));
                }

                setData(prev => ({ ...prev, isLoading: false }));
            } catch (error) {
                setData(prev => ({ ...prev, isLoading: false, serverError: error }));
            }
        };

        fetchData();
    }, [query]);

    return [getData, setData];
}
