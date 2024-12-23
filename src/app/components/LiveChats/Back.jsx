import { useRouter } from "next/navigation";
import { LiaAngleLeftSolid } from "react-icons/lia";

const Back = ({ page }) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-3 items-center text-center py-4 h-[8%] ">
      <span
        onClick={router.back}
        className="space-x-2  flex justify-start pl-4 items-center font-semibold text-sm"
      >
        <LiaAngleLeftSolid />
        Back
      </span>
      <h2 className=" text-center text-nowrap capitalize text-[0.65rem] font-bold my-0">
        {page}
      </h2>
      <span></span>
    </div>
  );
};

export default Back;
