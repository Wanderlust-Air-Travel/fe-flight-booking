import { FightInfoStore } from "@/types/fight-info";
import { reach } from "yup";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


const useStoreFightInfo = create<FightInfoStore>()(
    persist(
        (set)=>({
            data: {
                flightInstanceId:"",
                cabinType:""
            },
            setData: (newData) => {
                set((state)=>{
                    return {
                        data:{
                            ...newData,
                            ...state.data
                        }
                    }
                })
            }
        }),

        {
            name:"Fight-Info",
            storage:createJSONStorage(()=>{
                return sessionStorage
            })

        }
    )
)

export default useStoreFightInfo;