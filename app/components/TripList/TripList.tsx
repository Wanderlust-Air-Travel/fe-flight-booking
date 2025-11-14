
interface TripListType {
    icon: string;
    startTime: string; 
    airline: string; 
    duration: string; 
    price: string;
    stopCount: number; 
    stopDuration: string; 
  }
  


const TripList = ({icon,startTime,airline,duration,price,stopCount,stopDuration}:TripListType) =>{

    return(
        <ul className="border-[var(--cl-third)] border-[0.1rem] rounded-[2rem] overflow-hidden p-[0.2rem]">
            <li className="">

            </li>
        </ul>
    )
}

export default TripList