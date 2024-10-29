// /**
//  * @jest-environment jsdom
//  */

// import { screen } from "@testing-library/dom"
// import NewBillUI from "../views/NewBillUI.js"
// import NewBill from "../containers/NewBill.js"


// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then ...", () => {
//       const html = NewBillUI()
//       document.body.innerHTML = html
//       //to-do write assertion
//     })
//   })
// })

/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore, {newBillData} from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      
      expect(mailIcon).not.toBeFalsy(); // [Ajout de tests unitaires et d'intégration]
    });
  // Integration Test "POST new bill"

    test("Then the bill is added to API POST", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
    //   //to-do write assertion
    const bill = newBillData

    const expenseType = screen.getByTestId("expense-type");
    fireEvent.change(expenseType, { target: { value: bill.type } });
    expect(expenseType.value).toBe(bill.type);

    const expenseName = screen.getByTestId("expense-name");
    fireEvent.change(expenseName, { target: { value: bill.name } });
    expect(expenseName.value).toBe(bill.name);

    const expenseDate = screen.getByTestId("datepicker");
    fireEvent.change(expenseDate, { target: { value: bill.date } });
    expect(expenseDate.value).toBe(bill.date);

    const expenseAmount = screen.getByTestId("amount");
    fireEvent.change(expenseAmount, { target: { value: bill.amount } });
    expect(parseInt(expenseAmount.value)).toBe(parseInt(bill.amount));
    
    const expenseVat = screen.getByTestId("vat");
    fireEvent.change(expenseVat, { target: { value: bill.vat } });
    expect(parseInt(expenseVat.value)).toBe(parseInt(bill.vat));

    const expensePct = screen.getByTestId("pct");
    fireEvent.change(expensePct, { target: { value: bill.pct } });
    expect(parseInt(expensePct.value)).toBe(parseInt(bill.pct));

    const expenseComment = screen.getByTestId("commentary");
    fireEvent.change(expenseComment, { target: { value: bill.commentary } });
    expect(expenseComment.value).toBe(bill.commentary);

    const newBillForm = screen.getByTestId("form-new-bill");
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const handleChangeFile = jest.fn(newBill.handleChangeFile);
    newBillForm.addEventListener("change", handleChangeFile);
    const fileField = screen.getByTestId("file");
    fireEvent.change(fileField, {
      target: {
        files: [
          new File([bill.fileName], bill.fileUrl, { type: "image/png" }),
        ],
      },
    });
    expect(fileField.files[0].name).toBe(bill.fileUrl);
    expect(fileField.files[0].type).toBe("image/png");
    expect(handleChangeFile).toHaveBeenCalled();

    const handleSubmit = jest.fn(newBill.handleSubmit);
    newBillForm.addEventListener("submit", handleSubmit);
    fireEvent.submit(newBillForm);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
});