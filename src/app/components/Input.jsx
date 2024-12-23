import Image from "next/image";
const Input = ({
    update,
    credentials,
    inputType,
    image,
    id,
    required = true,
    length = 12,
}) => {
    return (
        <div
            // style={{ boxShadow: "#dbdbdb -1px 1px 11px 5px" }}
            className="mt-0 flex  relative rounded-md"
        >
            <div className="absolute top-0 flex justify-center items-center left-0 h-full aspect-square px-1.5 py-1.5 ">
                <Image
                    src={`/${image}`}
                    alt="correct"
                    width={20}
                    height={20}
                ></Image>
            </div>
            <div className="absolute top-0 flex justify-center items-center right-0  h-full aspect-square px-1.5 py-1.5 ">
                {id === "ConfPassword" ? (
                    credentials[id] === credentials["Password"] &&
                    credentials["Password"] !== "" ? (
                        <Image
                            src={`/tick_mark.png`}
                            alt="correct"
                            width={20}
                            height={20}
                        ></Image>
                    ) : (
                        <Image
                            src={`/wrong.png`}
                            alt="correct"
                            width={20}
                            height={20}
                        ></Image>
                    )
                ) : credentials[id] && credentials[id].length > 2 ? (
                    <Image
                        src={`/tick_mark.png`}
                        alt="correct"
                        width={20}
                        height={20}
                    ></Image>
                ) : (
                    <Image
                        src={`/wrong.png`}
                        alt="correct"
                        width={20}
                        height={20}
                    ></Image>
                )}
            </div>

            <input
                id={id}
                name={id}
                type={inputType}
                value={credentials[id]}
                onChange={update}
                minLength={3}
                maxLength={length}
                placeholder="Eg.Abcd123"
                autoComplete="current-password"
                required={required}
                className="block w-full px-[2.7rem] rounded-md border-0 bg-white/50 py-[0.7rem] text-slate-800 shadow-md ring-2 ring-inset outline-none focus:ring-2 ring-[#11468F] focus:ring-inset  sm:text-sm sm:leading-6"
            />
        </div>
    );
};

export default Input;
