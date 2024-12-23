import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        Session: { type: String, required: true },
        VipLevel: { type: Number, default: 0 },
        UserName: { type: String, required: true },
        Password: { type: String, required: true },
        Blocked: { type: Boolean, default: false },
        Avatar: { type: Number, default: 0 },
        Spin: { type: Number, default: 0 },
        FirstDeposit: { type: Boolean, default: true },
        PhoneNumber: { type: String },
        International: { type: Boolean, default: false },
        EmailId: { type: String },
        InvitationCode: { type: Number, required: true, unique: true },
        ParentInv: { type: Number, default: 0 },
        Parent: { type: String, default: "" },
        Balance: { type: Number, default: 0 }, // balance * 100 is being stored
        ValidAmount: { type: Number, default: 0 }, // * 100
        ValidDeposit: { type: Number, default: 0 }, // * 100
        Deposited: { type: Number, default: 0 },
        Withdrawal: { type: Number, default: 0 }, // Withdrawal * 100
        Members: { type: Number, default: 0 },
        LocalBankAdded: { type: Boolean, default: false },
        UsdtBankAdded: { type: Boolean, default: false },
        Commission: { type: Number, default: 0 },
        JoinedOn: { type: String, default: "" },
        LocalBank: {
            type: Object,
            default: {
                AccHolderName: "",
                BankName: "",
                AccNumber: "",
                Ifsc: "",
                BranchName: "",
                WithdrawCode: '',
            },
        },
        UsdtBank: {
            type: Object,
            default: {
                UsdtAddress: "",
                AppName: "",
            },
        },
    },
    { timestamps: true }
);

const BetSchema = new Schema(
    {
        Team_a: { type: String, required: true },
        Team_b: { type: String, required: true },
        Team_a_logo: { type: String, required: true },
        Team_b_logo: { type: String, required: true },
        LeagueName: { type: String, required: true },
        StakeId: { type: Number, required: true },
        BetAmount: { type: Number, required: true }, //amount * 100
        Percentage: { type: Number, required: true },
        StartsAt: { type: String, required: true },
        Score_a: { type: Number, required: true },
        Score_b: { type: Number, required: true },
        Result_a: { type: Number, default: 0 },
        Result_b: { type: Number, default: 0 },
        Status: { type: Number, default: 0 }, //0->pending 1->settled 2->canceled
        Remark: { type: String }, //win / lose
        Parent: { type: String, default: "" },
        UserName: { type: String, required: true },
        InvitationCode: { type: Number, required: true },
    },
    { timestamps: true }
);

const CommissionSchema = new Schema(
    {
        UserName: { type: String, required: true },
        Commission: { type: Number, required: true }, // * 100
        Date: { type: String, required: true }, //dd/mm/yyy
        Claimed: { type: Boolean, default: false },
        LeagueName: { type: String, default: "" },
        From: { type: String, required: true },
        StakeId: { type: Number, required: true },
    },
    { timestamps: true }
);

const TransactionSchema = new Schema(
    {
        UserName: { type: String, required: true },
        Amount: { type: Number, required: true },
        TransactionId: { type: String, required: true, unique: true },
        Method: { type: String, required: true },
        Status: { type: Number, default: 0 }, // 0->pending , 1->done , 2->canceled
        Remark: { type: String, required: true },
        Parent: { type: String, default: "" },
        Date: { type: String, required: true },
        Type: { type: String, required: true }, //withdrawal / deposit
        Bank: { type: Object, default: {} },
        From: { type: String, default: "" },
    },
    { timestamps: true }
);

const RewardsSchema = new Schema(
    {
        UserName: { type: String, required: true },
        Type: { type: String, required: true }, //any , invReward , weeklyCommission
        Amount: { type: Number, required: true }, //*100
        Remark: { type: String, required: true },
        Status: { type: Number, default: 0 }, //0->pending , 1->done
    },
    { timestamps: true }
);

const MatchSchema = new Schema({
    data: { type: String, default: "0" },
    version: { type: Number, default: 0 },
});
MatchSchema.pre("findOneAndUpdate", function (next) {
    this._update.$inc = this._update.$inc || {};
    this._update.$inc.version = 1;
    next();
});

const AdminData = new Schema({
    QrChannel1: { type: String, default: "" },
    QrChannel2: { type: String, default: "" },
    QrChannel3: { type: String, default: "" },
    QrChannel4: { type: String, default: "" },
    UpiIds: {
        type: Array,
        default: [],
    },
    BankDetails: {
        type: Object,
        default: {
            BankName: "",
            AccNumber: "",
            AccHolderName: "",
            Ifsc: "",
        },
    },
});

const FixedDeposit = new Schema(
    {
        UserName: { type: String, required: true },
        Duration: { type: String, required: true },
        Amount: { type: Number, required: true }, //*100
        Percent: { type: Number, required: true },
        Status: { type: Number, default: 0 }, //0->pending , 1->done
    },
    { timestamps: true }
);

export const ADMIN =
    mongoose?.models?.admins || mongoose?.model("admins", AdminData);
export const USER =
    mongoose?.models?.users || mongoose?.model("users", UserSchema);
export const BET = mongoose?.models?.bets || mongoose.model("bets", BetSchema);
export const COMMISSION =
    mongoose?.models?.commissions ||
    mongoose?.model("commissions", CommissionSchema);
export const TRANSACTION =
    mongoose?.models?.transactions ||
    mongoose?.model("transactions", TransactionSchema);
export const REWARD =
    mongoose?.models?.rewards || mongoose.model("rewards", RewardsSchema);
export const MATCH =
    mongoose?.models?.matches || mongoose?.model("matches", MatchSchema);
export const FIXEDDEPOST =
    mongoose?.models?.fixedDeposit ||
    mongoose?.model("fixedDeposit", FixedDeposit);
// module.exports = { USER, BET, MATCH, COMMISSION, TRANSACTION, REWARD };

export const config = {
    runtime: "edge", // for Edge API Routes only
    unstable_allowDynamic: [
        // allows a single file
        "/src/app/modals/modal.js",
        "/src/app/helpers/auth.js",
        "/node_modules/function-bind/**",
        // use a glob to allow anything in the function-bind 3rd party module
        "/node_modules/mongoose/dist/browser.umd.js",
    ],
};
