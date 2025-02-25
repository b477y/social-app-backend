import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const register = joi
  .object()
  .keys({
    username: generalFields.username.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
    phoneNumber: generalFields.phoneNumber.required(),
  })
  .required();
  
  export const confirmEmail = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    OTP: generalFields.OTP.required(),
  })
  .required();

export const login = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  })
  .required();
  
  export const forgetPassword = joi
  .object()
  .keys({
    email: generalFields.email.required(),
  })
  .required();
  
  export const validateForgetPassword = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    OTP: generalFields.OTP.required(),
  })
  .required();
  
  export const resetPassword = joi
    .object()
    .keys({
      email: generalFields.email.required(),
      OTP: generalFields.OTP.required(),
      password: generalFields.password.required(),
      confirmationPassword: generalFields.confirmationPassword.required(),
    })
    .required();