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

import entity.Concept;
import entity.ConceptDetails;
import javax.annotation.Resource;
import javax.ejb.EJB;
import javax.ejb.SessionContext;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.ejb.TransactionManagement;
import javax.ejb.TransactionManagementType;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 *
 * @author Luis Salazar <bp.lusv@gmail.com>
 */
@Stateless
@TransactionManagement(TransactionManagementType.CONTAINER)
public class ConceptManager {

    @PersistenceContext(unitName = "lelPU")
    private EntityManager em;
    @Resource
    private SessionContext context;
    
    @EJB
    private DocumentFacade documentFacade;
    
    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public int createConcept(String name, String notion) {
        try {
            ConceptDetails conceptDetails = addConceptDetails(notion);
            Concept concept = addConcept(conceptDetails, name);
            return concept.getId();
        } catch (Exception e) {
            context.setRollbackOnly();
            return -1;
        }
    }

    private ConceptDetails addConceptDetails(String notion) {
        ConceptDetails conceptDetails = new ConceptDetails();
        conceptDetails.setNotion(notion);
        
        em.persist(conceptDetails);
        em.flush();
        return conceptDetails;
    }

    private Concept addConcept(ConceptDetails conceptDetails, String name) {
        Concept concept = new Concept();
        concept.setConceptDetailsId(conceptDetails);
        concept.setDocumentId((documentFacade.find(1)));
        concept.setName(name);
        
        em.persist(concept);
        em.flush();
        return concept;
    }
}
