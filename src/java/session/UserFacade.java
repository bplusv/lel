/*
 * The MIT License
 *
 * Copyright 2012 Luis Salazar <bp.lusv@gmail.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package session;

import java.security.MessageDigest;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.ejb.TransactionManagement;
import javax.ejb.TransactionManagementType;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceException;
import model.User;

/**
 *
 * @author Luis Salazar <bp.lusv@gmail.com>
 */
@Stateless
@TransactionManagement(TransactionManagementType.CONTAINER)
public class UserFacade extends AbstractFacade<User> {

    @PersistenceContext(unitName = "lelPU")
    private EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    public UserFacade() {
        super(User.class);
    }

    public User findByName(String name) {
        try {
            return (User) em.createNamedQuery("User.findByName").
                    setParameter("name", name).
                    getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validName(String name) {

        try {
            String caracters[] = {" ", "#", "$", "&", "/",
                "(", ")", "=", "?", "¿", "{", "}", "[", "]",
                ";", ",", "¡", "!", "°", "|", "¬", "<", ">",
                ".", ":", "-", "_", "%"};
            boolean success = true;
            for (int i = 0; i < caracters.length && success == true; i++) {
                if (name.indexOf(caracters[i]) != -1) {
                    success = false;
                }
            }
            return success;

        } catch (Exception e) {
            return false;
        }
    }

    public boolean passwordConfirmation(String password, String passwordConfirmation) {
        if (password.equals(passwordConfirmation)) {
            return true;
        } else {
            return false;
        }
    }

    private String makeHash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] array = md.digest(input.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < array.length; ++i) {
                sb.append(Integer.toHexString(
                        (array[i] & 0xFF) | 0x100).substring(1, 3));
            }
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }

    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public User signIn(String username, String password) {
        try {
            User user = findByName(username);
            if (user.getPassword().equals(makeHash(password))) {
                return user;
            } else {
                return null;
            }
        } catch (Exception e) {
            context.setRollbackOnly();
            return null;
        }
    }
    
    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public Boolean changePassword(String loggedUserId, String currentPassword,
            String newPassword, String confirmNewPassword) {
        try {
            Boolean success = false;
            User user = find(loggedUserId);
            if (!newPassword.isEmpty() && newPassword.equals(confirmNewPassword)
                    && user.getPassword().equals(makeHash(currentPassword))
                    && !user.getPassword().equals(makeHash(newPassword))) {
                user.setPassword(makeHash(newPassword));
                em.merge(user);
                em.flush();
                success = true;
            }
            return success;
        } catch (Exception e) {
            context.setRollbackOnly();
            return false;
        }
    }

    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public FacadeResponse registerUser(String username, String password, String passwordConfirmation) {
        String message = "";
        try {
            if (!validName(username)) {
                return new FacadeResponse(null, "register fail invalid username");
            } else if (!password.equals(passwordConfirmation)) {
                return new FacadeResponse(null, "register fail password mismatch");
            }else if(password.equals("")){
                return new FacadeResponse(null, "register fail password empty");
            }
            User user = new User();
            user.setName(username);
            user.setPassword(makeHash(password));
            em.persist(user);
            em.flush();

            return new FacadeResponse(user, null);
        } catch(PersistenceException e) {
            return new FacadeResponse(null, "register fail username exists");
        } catch (Exception e) {
            context.setRollbackOnly();
            return new FacadeResponse(null, "register fail");
        }
    }
}