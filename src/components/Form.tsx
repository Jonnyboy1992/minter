import useNotification from "hooks/useNotification";
import { useForm } from "react-hook-form";
import useConnectionStore from "store/connection-store/useConnectionStore";
import { Box, Typography } from "@mui/material";
import { Control, Controller } from "react-hook-form";
import { styled } from "@mui/material";
import { useRef } from "react";
import FieldDescription from "components/FieldDescription";
import NumberFormat from "react-number-format";
import { AppButton } from "components/appButton";

interface FormProps {
  onSubmit: (values: any) => Promise<void>;
  inputs: any[];
  disableExample?: boolean;
  submitText: string;
  defaultValues?: {};
}

function Form({ onSubmit, inputs, disableExample, submitText, defaultValues }: FormProps) {
  const { showNotification } = useNotification();
  const { address, toggleConnect } = useConnectionStore();

  const { control, handleSubmit, formState, setValue, clearErrors } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  const onFormError = (value: any) => {
    const firstError = value[Object.keys(value)[0]];
    if (!firstError) {
      return;
    }
    showNotification(<>{firstError.message}</>, "warning", undefined, 3000);
  };

  const onExampleClick = (name: never, value: never) => {
    setValue(name, value);
  };

  const errors = formState.errors as any;

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit, onFormError)}>
      <StyledFormInputs>
        {inputs.map((spec: any, index: number) => {
          return (
            <Input
              disableExample={disableExample}
              required={spec.required}
              description={spec.description}
              clearErrors={clearErrors}
              key={index}
              error={errors[spec.name]}
              name={spec.name}
              type={spec.type}
              control={control}
              label={spec.label}
              defaultValue={spec.default || ""}
              onExampleClick={() => onExampleClick(spec.name as never, spec.default as never)}
              disabled={spec.disabled}
              errorMessage={spec.errorMessage}
              validate={spec.validate}
            />
          );
        })}
      </StyledFormInputs>
      <StyledActionBtn>
        {!address ? (
          <AppButton
            height={44}
            width={150}
            fontWeight={700}
            type="button"
            onClick={() => toggleConnect(true)}
            background="#0088CC">
            Connect wallet
          </AppButton>
        ) : (
          <AppButton width={150} height={44} type="submit">
            {submitText}
          </AppButton>
        )}
      </StyledActionBtn>
    </StyledForm>
  );
}

export default Form;

const StyledForm = styled("form")({
  width: "100%",
});

const StyledFormInputs = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 17,
});

const StyledActionBtn = styled(Box)({
  marginTop: 30,
  marginBottom: 10,
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  "& .base-button": {
    maxWidth: 150,
    width: "100%",
  },
});

interface InputProps {
  error: boolean;
  label: string;
  control: Control;
  name: string;
  defaultValue: string | number;
  onExampleClick: () => void;
  type?: any;
  required?: boolean;
  clearErrors: any;
  disabled?: boolean;
  validate?: (val: string) => boolean;
  errorMessage?: string;
  description: string;
  disableExample?: boolean;
}

function Input({
  description,
  defaultValue,
  control,
  error,
  label,
  name,
  onExampleClick,
  type = "string",
  clearErrors,
  disabled,
  errorMessage,
  disableExample = false,
  validate,
}: InputProps) {
  const ref = useRef<any>();

  const onFocus = () => {
    clearErrors(name);
  };

  return (
    <StyledContainer>
      <Controller
        name={name}
        control={control}
        defaultValue={disabled ? defaultValue : ""}
        rules={{
          required: errorMessage,
        }}
        render={({ field: { onChange, value } }) => (
          <StyledInputContainer error={error}>
            {type === "number" ? (
              <NumberFormat
                value={value}
                name={name}
                placeholder={label}
                customInput={StyledInput}
                type="text"
                thousandSeparator=","
                onValueChange={({ value }) => {
                  onChange(value);
                }}
                isAllowed={(values) => {
                  if (validate) return validate(values.value);
                  return true;
                }}
                onFocus={onFocus}
                disabled={disabled}
                style={{
                  opacity: disabled ? 0.5 : 1,
                }}
              />
            ) : (
              <StyledInput
                ref={ref}
                value={value || ""}
                onFocus={onFocus}
                onChange={onChange}
                placeholder={label}
                disabled={disabled}
                type={type}
                style={{
                  opacity: disabled ? 0.5 : 1,
                }}
              />
            )}
          </StyledInputContainer>
        )}
      />
      <FieldDescription>
        {description}
        {!disabled && !disableExample && (
          <Typography
            sx={{
              display: "inline",
              fontWeight: 800,
              "&:hover": {
                cursor: "pointer",
              },
            }}
            variant="body2"
            onClick={() => onExampleClick()}>
            {" "}
            example
          </Typography>
        )}
      </FieldDescription>
    </StyledContainer>
  );
}

const StyledContainer = styled(Box)({
  width: "100%",
});

const StyledInputContainer = styled(Box)(({ error }: { error: boolean }) => ({
  width: "100%",
  height: 45,
  display: "flex",
  alignItems: "center",
  background: "#F7F9FB",
  border: "0.5px solid rgba(114, 138, 150, 0.16)",
  borderRadius: 40,
  paddingRight: 5,
  transition: "0.2s all",
  "& .base-button": {
    height: "calc(100% - 10px)",
    padding: "0px 15px",
    fontSize: 12,
  },
}));

const StyledInput = styled("input")({
  flex: 1,
  height: "100%",
  border: "unset",
  textIndent: 16,
  background: "transparent",
  outline: "none",
  color: "#000",
  fontFamily: "Mulish",
  fontSize: 16,
  caretColor: "#728A96",
  "&::placeholder": {
    color: "#728A96",
    fontFamily: "Mulish",
    transition: "0.2s all",
  },
  "&:focus": {
    "&::placeholder": {
      opacity: 0,
    },
  },
});
