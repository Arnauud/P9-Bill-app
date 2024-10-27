/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from '@testing-library/user-event';
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
         type: "Employee" 
        }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      
      expect(windowIcon).toBeTruthy(); // [Ajout de tests unitaires et d'intégration] - composant views/Bills
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills }); // [Bug report] - Bills (dates)
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [ ...dates ].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

// [Ajout de tests unitaires et d'intégration] - composant views/Bills
describe("After having clicked on the eye icon for a bill", () => {
  test("A modal should then open", async () => {
    
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee" // modified type 
    }));
    
    const onNavigate = pathname => { 
    document.body.innerHTML = ROUTES({ pathname }); 
  };
  
    const billedContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
    document.body.innerHTML = BillsUI({ data: bills });

    // Mock handledClickedIconEye
    const handledClickedIconEye = jest.fn(icon => billedContainer.handleClickIconEye(icon));
    const iconEyeId = screen.getAllByTestId("icon-eye");
    const modaleFileId = document.getElementById("modaleFile");

    // Mock the modal opening behavior
    $.fn.modal = jest.fn(() => modaleFileId.classList.add("show"));

    iconEyeId.forEach(icon => {
      // Add event listener using the mock function
      icon.addEventListener("click", () => handledClickedIconEye(icon));
      
      // Simulate user clicking the icon
      userEvent.click(icon);

      // Check that the function was called
      expect(handledClickedIconEye).toHaveBeenCalledWith(icon);
    });

    // Check if the modal is shown
    expect(modaleFileId.classList.contains("show")).toBe(true);
  });
});

  describe("After clicking on New Bill button", () => {
    test("A New Bill page should then open", async () => {
      const onNavigate = pathname => { 
        document.body.innerHTML = ROUTES({ pathname }); 
      };

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee" 
      }));
      
      const billedContainer = new Bills({ 
        document, onNavigate, store: null, localStorage: window.localStorage 
      });
      document.body.innerHTML = BillsUI({ data: bills }); // From Dashboard.js

      const newBtnBill = await screen.getByTestId("btn-new-bill");
      const handledClickedNewBill = jest.fn(() => billedContainer.handleClickNewBill);
      newBtnBill.addEventListener("click", handledClickedNewBill);

      userEvent.click(newBtnBill);
      expect(handledClickedNewBill).toHaveBeenCalled();
    });
  });
});


// test Intégration GET Bills -- refer to "__test__/Dashboard.js" L.243 
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee"}));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais")); //string content modified
      expect(screen.getByTestId("tbody")).toBeTruthy(); // checking if it's true
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(
        window, 
          "localStorage", 
          { value: localStorageMock }
        );
      localStorage.setItem("user", JSON.stringify({ 
        type: "Employee"
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });
    test("fetches bills from an API and fails with 404 message error", async () => { //reused from Dashboard.js test
      
      mockStore.bills.mockImplementationOnce(() => {
        return { 
          list: () => { 
            return Promise.reject(new Error("Erreur 404"));         
        }};
      });
      window.onNavigate(ROUTES_PATH.Bills); //update path to bills
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    
    test("fetches messages from an API and fails with 500 message error", async () => { //reused from Dashboard.js test
      mockStore.bills.mockImplementationOnce(() => {
        return { 
          list: () => { 
          return Promise.reject(new Error("Erreur 500")); 
        }};
      });

      window.onNavigate(ROUTES_PATH.Bills); //update path to bills
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});