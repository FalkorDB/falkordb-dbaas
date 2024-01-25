import { Skeleton } from "@/components/ui/skeleton"

interface ButtonProps {
    text: string;
  }

function Spinning( props: ButtonProps) {
    return (<div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-20 space-y-4">
            <div className="text-blue-600 text-4xl ">
                {props.text}
            </div>
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full bg-blue-600" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px] bg-blue-600" />
                    <Skeleton className="h-4 w-[200px] bg-blue-600" />
                </div>
            </div>
        </main>
    </div>
    )
}

export default Spinning