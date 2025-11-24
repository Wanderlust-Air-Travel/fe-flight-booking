"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";


const Breadcrumb = () => {

    const pathname = usePathname();
    console.log(pathname)
    const lists = pathname.split("/").filter(Boolean)[0];
    console.log(lists)

    return (
        <div className="pt-[2rem]">
            <div className="container">
                <ul className="breadcrumb-list">
                    <li className="breadcrumb-item">
                        <Link className="breadcrumb-link" href="/">
                            Home
                        </Link>
                    </li>
                    <li  className="breadcrumb-item">

                        <Link className="breadcrumb-link" href={`/${lists}`}>
                            {lists}
                        </Link>
                    </li>
                   
                </ul>
            </div>
        </div>
    )
}

export default Breadcrumb;