import ImageKit from "imagekit";
import { NextResponse } from "next/server";
// import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const imagekit = new ImageKit({
  publicKey: "public_vqtKMKdE65ozlbDD5YOmev2NHuQ=", // Replace with your ImageKit public key
  privateKey: "private_C67/pJuClf2XA2CNN4mK5BnBxfk=", // Replace with your ImageKit private key
  urlEndpoint: "https://ik.imagekit.io/77htx0vcw", // Replace with your ImageKit endpoint
});

export async function GET (req, res) {
    try {
        
        const authParams = imagekit.getAuthenticationParameters();
        return NextResponse.json(authParams, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
            cache: 'no-store'
        })
    } catch (error) {
        console.log(error);
        return res.status(405).json({message : 'error'});
    }
}
