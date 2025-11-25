import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb"
import ServiceAll from "@/app/components/Services/ServiceAll"

const ServicePage = () =>{
    return(
        <main className="pt-[var(--hd)] flex flex-col gap-y-[2rem]">
            <Breadcrumb />
            <section>
                <div className="container">
                    <div className="flex flex-col gap-y-[2rem]">
                        <h2 className="text-lg uppercase text-[var(--cl-pri)] font-bold">Services</h2>
                        <ServiceAll />
                    </div>
                </div>
            </section>
        </main>
    )
}

export default ServicePage